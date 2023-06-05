import { ChangeEventHandler, useId } from 'react';
import styles from './switch.module.scss';

export interface SwitchProps {
  checked?: boolean;
  handleChange?: ChangeEventHandler<HTMLInputElement>;
}

export function Switch({ checked, handleChange }: SwitchProps) {
  const inputId = useId();

  return (
    <>
      <input
        type="checkbox"
        defaultChecked={!handleChange ? checked : undefined}
        checked={!handleChange ? undefined : checked}
        onChange={handleChange}
        id={inputId}
        className={styles.checkbox}
      />
      <label htmlFor={inputId} className={styles.label}>
        <span className={styles.button} />
      </label>
    </>
  );
}

export default Switch;
