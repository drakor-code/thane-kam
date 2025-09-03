import { EventEmitter } from "events"

export interface DebtEvent {
  type:
    | "supplier_created"
    | "supplier_updated"
    | "supplier_deleted"
    | "customer_created"
    | "customer_updated"
    | "customer_deleted"
    | "user_created"
    | "user_updated"
    | "user_deleted"
    | "debt_added"
    | "payment_added"
    | "settings_updated"
  data: any
  userId: string
  timestamp: Date
}

class DebtEventEmitter extends EventEmitter {
  private static instance: DebtEventEmitter

  static getInstance(): DebtEventEmitter {
    if (!DebtEventEmitter.instance) {
      DebtEventEmitter.instance = new DebtEventEmitter()
    }
    return DebtEventEmitter.instance
  }

  emitDebtEvent(event: DebtEvent) {
    this.emit("debt-update", event)
  }

  onDebtUpdate(callback: (event: DebtEvent) => void) {
    this.on("debt-update", callback)
  }

  offDebtUpdate(callback: (event: DebtEvent) => void) {
    this.off("debt-update", callback)
  }
}

export const debtEventEmitter = DebtEventEmitter.getInstance()
