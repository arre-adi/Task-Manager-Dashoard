import { ArrowUpRight } from "lucide-react";

export function StatCard({ label, value, tone = "default", trend = "", onClick }) {
  return (
    <button className={`stat-card stat-card--${tone}`} onClick={onClick} type="button">
      <div className="stat-card__top">
        <span className="stat-card__label">{label}</span>
        <div className="stat-card__arrow">
          <ArrowUpRight size={22} strokeWidth={2.2} />
        </div>
      </div>
      
      <div className="stat-card__middle">
        <strong className="stat-card__value">{value}</strong>
      </div>
      
   
    </button>
  );
}
