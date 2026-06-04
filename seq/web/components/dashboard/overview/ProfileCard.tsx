import { Icon } from "@/components/ui/Icon";
import { initial } from "@/lib/utils";
import type { DashboardSection } from "@/lib/types";

interface Props {
  name: string;
  onGo: (s: DashboardSection) => void;
}

export function ProfileCard({ name, onGo }: Props) {
  return (
    <div className="ov-prof">
      <div>
        <div className="av">{initial(name)}</div>
        <div className="nm">{name}</div>
        <div className="rl">ДОХИО хэрэглэгч</div>
        <div className="chip"><span className="d" /> Идэвхтэй</div>
      </div>
      <div className="acts">
        <button className="g" onClick={() => onGo("translator")}><Icon name="hand" size={17} /> Эхлэх</button>
        <button className="o" onClick={() => onGo("call")}><Icon name="video" size={17} /></button>
      </div>
    </div>
  );
}
