"""Patch Keras 3 modelTopology JSON for TensorFlow.js Layers compatibility."""
from __future__ import annotations

from typing import Any


def _dtype_to_str(value: Any) -> Any:
    if isinstance(value, dict) and value.get("class_name") == "DTypePolicy":
        cfg = value.get("config") or {}
        return cfg.get("name", "float32")
    return value


def _walk_config(obj: Any) -> Any:
    if isinstance(obj, list):
        return [_walk_config(x) for x in obj]
    if not isinstance(obj, dict):
        return obj
    out: dict[str, Any] = {}
    for key, val in obj.items():
        if key == "dtype":
            out[key] = _dtype_to_str(val)
        elif key == "reset_after" and val is True:
            # TFJS GRU does not support Keras 3 reset_after=True.
            out[key] = False
        else:
            out[key] = _walk_config(val)
    return out


def _convert_inbound_nodes(nodes: Any) -> list[Any]:
    if not nodes:
        return []
    # Already TFJS / Keras 2 nested-array format.
    if isinstance(nodes[0], list):
        return nodes

    converted: list[Any] = []
    for node in nodes:
        if not isinstance(node, dict) or "args" not in node:
            continue
        node_data: list[Any] = []
        kwargs = node.get("kwargs") or {}
        for arg in node.get("args", []):
            if not isinstance(arg, dict):
                continue
            if arg.get("class_name") != "__keras_tensor__":
                continue
            hist = (arg.get("config") or {}).get("keras_history")
            if hist and len(hist) >= 3:
                node_data.append([hist[0], hist[1], hist[2], kwargs])
        if node_data:
            converted.append(node_data)
    return converted


def patch_layer(layer: dict[str, Any]) -> dict[str, Any]:
    layer = dict(layer)
    layer["config"] = _walk_config(layer.get("config") or {})

    cfg = layer["config"]
    if layer.get("class_name") == "InputLayer":
        if "batch_shape" in cfg and "batch_input_shape" not in cfg:
            cfg["batch_input_shape"] = cfg.pop("batch_shape")

    # Keras 3 Bidirectional embeds pre-prefixed GRU names; TFJS adds forward_/backward_ itself.
    if layer.get("class_name") == "Bidirectional":
        for key in ("layer", "backward_layer"):
            nested = cfg.get(key)
            if isinstance(nested, dict) and isinstance(nested.get("config"), dict):
                ncfg = nested["config"]
                name = ncfg.get("name", "")
                if name.startswith("forward_") or name.startswith("backward_"):
                    ncfg["name"] = "gru"

    layer["inbound_nodes"] = _convert_inbound_nodes(layer.get("inbound_nodes"))
    return layer


def patch_model_topology(topology: dict[str, Any]) -> dict[str, Any]:
    topology = dict(topology)
    topology["keras_version"] = "2.15.0"
    model_cfg = topology.get("model_config") or {}
    if model_cfg.get("class_name") != "Functional":
        return topology
    inner = model_cfg.get("config") or {}
    layers = inner.get("layers")
    if isinstance(layers, list):
        inner["layers"] = [patch_layer(l) for l in layers]
    return topology


# Keras 3 / TFJS weight path fixes (inner GRU names → Bidirectional scope).
_WEIGHT_PREFIX_REWRITES = (
    ("forward_gru_1/", "bidirectional_1/forward_gru/"),
    ("backward_gru_1/", "bidirectional_1/backward_gru/"),
    ("forward_gru/", "bidirectional/forward_gru/"),
    ("backward_gru/", "bidirectional/backward_gru/"),
)


def _rewrite_weight_name(name: str) -> str:
    name = name.replace("/gru_cell/", "/")
    for old, new in _WEIGHT_PREFIX_REWRITES:
        if name.startswith(old):
            return new + name[len(old) :]
    return name


def patch_weights_manifest(manifest: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Align Keras 3 GRU weight names with TFJS Bidirectional layer scope."""
    out = []
    for group in manifest:
        group = dict(group)
        weights = []
        for w in group.get("weights", []):
            w = dict(w)
            w["name"] = _rewrite_weight_name(w["name"])
            weights.append(w)
        group["weights"] = weights
        out.append(group)
    return out


def patch_model_json_file(path: str) -> None:
    import json

    with open(path, encoding="utf-8") as f:
        raw = json.load(f)
    topo = raw.get("modelTopology")
    if isinstance(topo, dict):
        raw["modelTopology"] = patch_model_topology(topo)
    if raw.get("weightsManifest"):
        raw["weightsManifest"] = patch_weights_manifest(raw["weightsManifest"])
    with open(path, "w", encoding="utf-8") as f:
        json.dump(raw, f, ensure_ascii=False)
