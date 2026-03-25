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

.schedule-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 1rem 1.25rem 1rem 1rem;
  gap: 1.5rem;
  overflow: hidden;
}

.schedule-title {
  font-size: 2.8125rem;
  font-weight: 400;
  color: var(--theme-color-primary, #0f3a97);
  letter-spacing: -0.1125rem;
  margin: 2rem 0 0 0;
  line-height: normal;
  text-align: center;
  flex-shrink: 0;
}

.schedule-body {
  display: flex;
  flex: 1;
  min-height: 0;
  background: #fff;
  border-radius: 0.75rem;
  overflow: hidden;
  padding: 1.5rem;
  gap: 2rem;
}

.day-section {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  gap: 0.75rem;
  overflow: hidden;
}

.day-section + .day-section {
  border-left: 0.0625rem solid #f3f4f6;
  padding-left: 2rem;
}

.day-heading {
  font-size: 0.98rem;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  line-height: 1.333;
  flex-shrink: 0;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow: hidden;
  flex: 1;
  min-height: 0;
}

.event-item {
  display: flex;
  flex-direction: column;
  background: #ededed;
  border-left: 0.327rem solid var(--theme-color-primary, #0f3a97);
  border-radius: 0 0.5rem 0.5rem 0;
  padding: 0.5rem 0.75rem;
  gap: 0.2rem;
  flex-shrink: 0;
}

.event-title {
  font-size: 0.9rem;
  font-weight: 500;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: normal;
}

.event-time {
  font-size: 0.8rem;
  font-weight: 400;
  color: var(--theme-color-primary, #0f3a97);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: normal;
}

.no-events {
  font-size: 0.9rem;
  color: #9ca3af;
  text-align: center;
  padding: 1.5rem 0;
}`
