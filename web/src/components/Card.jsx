import React from 'react';
export default function Card({ title, subtitle, children, footer }) {
  return (
    <div className="card">
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-semibold text-slate-900">{title}</h3>}
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
      )}
      <div>{children}</div>
      {footer && <div className="mt-4 pt-4 border-t border-slate-100">{footer}</div>}
    </div>
  );
}