import { Icon, type IconName } from '@/components/Icon';
import { Button } from './Button';

interface EmptyProps {
  icon?: IconName;
  title: string;
  sub?: string;
  action?: string;
  /** Defaults to `plus` because most empty states offer to create the missing
      thing. Override it when the action opens something that already exists —
      a plus there promises a new record and delivers navigation. */
  actionIcon?: IconName;
  onAction?: () => void;
}

export function Empty({ icon = 'video', title, sub, action, actionIcon = 'plus', onAction }: EmptyProps) {
  return (
    <div className="flex flex-col items-center gap-2 bg-surface rounded-card py-16 px-6 shadow-card text-center">
      <span className="w-9 h-9 rounded-chip bg-fill flex items-center justify-center shrink-0 text-text-sub mb-1 [&_svg]:stroke-current">
        <Icon name={icon} size={17} />
      </span>
      <div className="text-[15px] font-semibold text-text">{title}</div>
      {sub && <div className="text-[13px] font-normal text-text-sub">{sub}</div>}
      {action && (
        <Button variant="black" className="mt-3" onClick={onAction}>
          <Icon name={actionIcon} size={15} stroke="#fff" />
          {action}
        </Button>
      )}
    </div>
  );
}

export function ErrorBanner({ title, sub, retryLabel = '再試行', onRetry }: { title: string; sub: string; retryLabel?: string; onRetry?: () => void }) {
  return (
    <div className="flex items-center gap-3 bg-surface rounded-card p-4 shadow-card">
      <span className="w-8 h-8 rounded-chip bg-orange-bg flex items-center justify-center shrink-0">
        <Icon name="alert" size={16} stroke="var(--color-orange)" />
      </span>
      <div className="flex-1 min-w-0 text-[13px]">
        <strong className="font-semibold text-text">{title}</strong> <span className="font-normal text-text-sub">{sub}</span>
      </div>
      <Button variant="outline" onClick={onRetry}>{retryLabel}</Button>
    </div>
  );
}
