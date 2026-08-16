import "server-only";
import { createClient } from "@/lib/supabase/server";
import {
  listCustomers,
  getCustomerById,
  getCustomerAddresses,
  getCustomerOrders,
} from "@/repositories/customers.repository";

export async function listCustomersForAdmin(params: {
  search?: string;
  page: number;
  pageSize: number;
}) {
  const supabase = await createClient();
  return listCustomers(supabase, params);
}

export async function getCustomerDetail(id: string) {
  const supabase = await createClient();
  const customer = await getCustomerById(supabase, id);
  if (!customer) return null;

  const [addresses, orders] = await Promise.all([
    getCustomerAddresses(supabase, id),
    getCustomerOrders(supabase, id),
  ]);

  const totalSpent = orders
    .filter((order) => order.payment_status === "paid")
    .reduce((sum, order) => sum + Number(order.total), 0);

  return { customer, addresses, orders, totalSpent, orderCount: orders.length };
}
