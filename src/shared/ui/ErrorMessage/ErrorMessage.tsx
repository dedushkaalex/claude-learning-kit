import type { ReactNode } from "react"
import { StatusMessage } from "../StatusMessage/StatusMessage"
import styles from "./ErrorMessage.module.css"

export function ErrorMessage({ children }: { children: ReactNode }) {
  return (
    <StatusMessage className={styles.error} role="alert">
      {children}
    </StatusMessage>
  )
}
