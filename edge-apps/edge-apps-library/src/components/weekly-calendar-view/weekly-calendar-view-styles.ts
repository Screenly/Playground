export const COMPONENT_CSS = `:host {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: transparent;
  font-family: 'Inter', system-ui, sans-serif;
  overflow: hidden;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

.weekly-calendar-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 1rem 1.25rem 1rem 1rem;
}

.this-week-title {
  font-size: 2.8125rem;
  font-weight: 400;
  font-style: normal;
  color: var(--theme-color-primary, #0f3a97);
  letter-spacing: -0.1125rem;
  margin: 2rem 0 2.875rem 0;
  line-height: normal;
  text-align: center;
  flex-shrink: 0;
}

.week-grid {
  display: flex;
  flex: 1;
  min-height: 0;
  background: #fff;
  border-radius: 0.75rem;
  overflow: hidden;
}

.time-gutter {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 6.5rem;
  padding-top: 5.225rem;
}

.time-label {
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding-right: 1rem;
  font-size: 0.98rem;
  color: #6b7280;
  white-space: nowrap;
  transform: translateY(-0.5em);
}

.days-grid {
  display: flex;
  flex: 1;
  min-width: 0;
  border-left: 0.0625rem solid #f3f4f6;
}

.day-column {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  border-right: 0.0625rem solid #f3f4f6;
}

.day-column:last-child {
  border-right: none;
}

.day-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.375rem 0.25rem;
  gap: 0.125rem;
  height: 5.225rem;
  flex-shrink: 0;
  border-bottom: 0.0625rem solid #f3f4f6;
}

.day-header.today {
  background: var(--theme-color-primary, #0f3a97);
}

.day-name {
  font-size: 0.98rem;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  line-height: 1.333;
}

.day-header.today .day-name {
  color: #fff;
  opacity: 0.8;
}

.day-date {
  font-size: 1.469rem;
  font-weight: 600;
  color: #111827;
  line-height: 1.556;
}

.day-header.today .day-date {
  color: #fff;
}

.day-body {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: visible;
}

.hour-row {
  flex: 1;
  border-bottom: 0.0625rem solid #f3f4f6;
  position: relative;
  min-height: 0;
}

.hour-row:last-child {
  border-bottom: none;
}

.event-wrapper {
  position: absolute;
  z-index: 2;
  padding: 0 0.653rem;
}

.event-item {
  height: 100%;
  background: #ededed;
  border-left: 0.327rem solid var(--theme-color-primary, #0f3a97);
  border-radius: 0 0.653rem 0.653rem 0;
  padding: 0.5rem 0.98rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 0.327rem;
}

.event-item.event-compact {
  justify-content: center;
  padding-top: 0;
  padding-bottom: 0;
}

.event-inline-time {
  color: var(--theme-color-primary, #0f3a97);
}

.event-item.clipped-top {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}

.event-item.clipped-bottom {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.event-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: normal;
}

.event-time {
  font-size: 0.75rem;
  font-weight: 400;
  color: var(--theme-color-primary, #0f3a97);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: normal;
}

.current-time-indicator {
  position: absolute;
  left: 0;
  right: 0;
  height: 0.125rem;
  background: #ea4335;
  z-index: 10;
  pointer-events: none;
}

.current-time-indicator::before {
  content: '';
  position: absolute;
  left: -0.27rem;
  top: -0.25rem;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: #ea4335;
}`
