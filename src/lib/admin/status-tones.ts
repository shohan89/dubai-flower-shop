import type { StatusTone } from "@/components/shared/status-badge";

export function orderStatusTone(status: string): StatusTone {
  switch (status) {
    case "delivered":
      return "success";
    case "cancelled":
    case "refunded":
      return "danger";
    case "out_for_delivery":
    case "ready_for_delivery":
      return "info";
    case "preparing":
    case "confirmed":
      return "warning";
    default:
      return "neutral";
  }
}

export function paymentStatusTone(status: string): StatusTone {
  switch (status) {
    case "paid":
      return "success";
    case "failed":
      return "danger";
    case "refunded":
    case "partially_refunded":
      return "warning";
    case "authorized":
      return "info";
    default:
      return "neutral";
  }
}

export function productStatusTone(status: string): StatusTone {
  switch (status) {
    case "active":
      return "success";
    case "archived":
      return "danger";
    default:
      return "neutral";
  }
}

export function reviewStatusTone(status: string): StatusTone {
  switch (status) {
    case "approved":
      return "success";
    case "rejected":
      return "danger";
    default:
      return "warning";
  }
}

export function activeInactiveTone(isActive: boolean): StatusTone {
  return isActive ? "success" : "neutral";
}
