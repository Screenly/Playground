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

.daily-calendar-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 1rem 1.25rem 1rem 1rem;
}

.today-title {
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

.day-grid {
  display: flex;
  flex: 1;
  min-height: 0;
  background: #fff;
  border-radius: 0.75rem;
  overflow: hidden;
  padding-top: 1.25rem;
}

.time-gutter {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  width: 6.5rem;
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

.day-body {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: visible;
  border-left: 0.0625rem solid #f3f4f6;
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

.events-area {
  position: absolute;
  top: 0;
  left: 0.653rem;
  bottom: 0;
  right: 1.25rem;
}

.event-wrapper {
  position: absolute;
  z-index: 2;
  outline: 0.125rem solid white;
  border-radius: 0 0.653rem 0.653rem 0;
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
  left: -0.25rem;
  top: 50%;
  transform: translateY(-50%);
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: #ea4335;
}`
