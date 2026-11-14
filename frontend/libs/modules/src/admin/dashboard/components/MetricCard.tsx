import { Icon } from "@acadly/infrastructure/components/common/Icon";
import type { IconName } from "@acadly/infrastructure/components/common/Icon";

type MetricCardProps = {
  label: string;
  value: string;
  detail: string;
  icon: IconName;
  trend?: string;
};

export function MetricCard({
  label,
  value,
  detail,
  icon,
  trend,
}: MetricCardProps) {
  return (
    <article className="rounded-2xl border border-border bg-white p-5 shadow-[0_1px_2px_rgba(27,48,35,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">
            {value}
          </p>
        </div>
        <span className="flex size-10 items-center justify-center rounded-xl bg-[#edf4ee] text-primary">
          <Icon name={icon} />
        </span>
      </div>
      <div className="mt-4 flex items-center gap-2 text-xs">
        {trend && (
          <span className="font-bold text-success">{trend}</span>
        )}
        <span className="text-muted">{detail}</span>
      </div>
    </article>
  );
}
