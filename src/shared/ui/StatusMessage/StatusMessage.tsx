import type { AriaRole, ReactNode } from "react"
import styles from "./StatusMessage.module.css"

type StatusMessageProps = {
  children: ReactNode
  className?: string | undefined
  role?: AriaRole | undefined
}

export function StatusMessage({ children, className, role }: StatusMessageProps) {
  return (
    <p
      className={className === undefined ? styles.message : `${styles.message} ${className}`}
      role={role}
    >
      {children}
    </p>
  )
}
