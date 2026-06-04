import { cx } from "@/lib/utils";

interface Props {
  on: boolean;
  onChange: () => void;
}

export function Toggle({ on, onChange }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      className={cx("dbtoggle", on && "on")}
      onClick={onChange}
    />
  );
}
