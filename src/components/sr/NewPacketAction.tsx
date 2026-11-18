import Link from "next/link";
import InterfaceIcon from "@/components/InterfaceIcon";

export default function NewPacketAction() {
  return <Link className="suite-new-packet-action" href="/dashboard/sr-packets/new">
    <span className="suite-new-packet-icon" aria-hidden="true"><InterfaceIcon name="plus" width={25} height={25} /></span>
    <span className="suite-new-packet-copy"><span>New S&amp;R packet</span><span>Start a new documentation episode</span></span>
    <InterfaceIcon className="suite-new-packet-arrow" name="arrow" width={20} height={20} />
  </Link>;
}
