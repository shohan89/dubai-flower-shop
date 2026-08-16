"use client";

import { useActionState, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/shared/form-field";
import { PriceInput } from "@/components/shared/price-input";
import { SubmitButton } from "@/components/shared/submit-button";
import {
  saveSiteSettingsAction,
  saveStoreSettingsAction,
  saveDeliverySettingsAction,
  savePaymentSettingsAction,
  saveSocialLinkAction,
  deleteSocialLinkAction,
  type SettingsFormState,
} from "@/app/admin/(dashboard)/settings/actions";
import type { Database } from "@/types/database.types";

type Settings = {
  site: Database["public"]["Tables"]["site_settings"]["Row"] | null;
  store: Database["public"]["Tables"]["store_settings"]["Row"] | null;
  delivery: Database["public"]["Tables"]["delivery_settings"]["Row"] | null;
  payment: Database["public"]["Tables"]["payment_settings"]["Row"] | null;
  socialLinks: Database["public"]["Tables"]["social_links"]["Row"][];
};

const initialState: SettingsFormState = {};

export function SettingsClient({ site, store, delivery, payment, socialLinks }: Settings) {
  return (
    <Tabs defaultValue="site">
      <TabsList>
        <TabsTrigger value="site">Site</TabsTrigger>
        <TabsTrigger value="store">Store</TabsTrigger>
        <TabsTrigger value="delivery">Delivery</TabsTrigger>
        <TabsTrigger value="payment">Payment</TabsTrigger>
        <TabsTrigger value="social">Social links</TabsTrigger>
      </TabsList>

      <TabsContent value="site" className="max-w-xl">
        <SiteForm site={site} />
      </TabsContent>
      <TabsContent value="store" className="max-w-xl">
        <StoreForm store={store} />
      </TabsContent>
      <TabsContent value="delivery" className="max-w-xl">
        <DeliveryForm delivery={delivery} />
      </TabsContent>
      <TabsContent value="payment" className="max-w-xl">
        <PaymentForm payment={payment} />
      </TabsContent>
      <TabsContent value="social" className="max-w-xl">
        <SocialLinksManager links={socialLinks} />
      </TabsContent>
    </Tabs>
  );
}

function SiteForm({ site }: { site: Settings["site"] }) {
  const [state, formAction] = useActionState(saveSiteSettingsAction, initialState);
  const [maintenance, setMaintenance] = useState(site?.maintenance_mode ?? false);

  return (
    <form action={formAction} className="space-y-4 pt-4">
      <FormField id="siteName" label="Site name" required>
        <Input id="siteName" name="siteName" defaultValue={site?.site_name} required />
      </FormField>
      <FormField id="siteDescription" label="Site description">
        <Textarea id="siteDescription" name="siteDescription" defaultValue={site?.site_description ?? ""} rows={2} />
      </FormField>
      <FormField id="logoUrl" label="Logo URL">
        <Input id="logoUrl" name="logoUrl" defaultValue={site?.logo_url ?? ""} />
      </FormField>
      <FormField id="faviconUrl" label="Favicon URL">
        <Input id="faviconUrl" name="faviconUrl" defaultValue={site?.favicon_url ?? ""} />
      </FormField>
      <FormField id="defaultSeoTitle" label="Default SEO title">
        <Input id="defaultSeoTitle" name="defaultSeoTitle" defaultValue={site?.default_seo_title ?? ""} />
      </FormField>
      <FormField id="defaultSeoDescription" label="Default meta description">
        <Textarea id="defaultSeoDescription" name="defaultSeoDescription" defaultValue={site?.default_seo_description ?? ""} rows={2} />
      </FormField>
      <FormField id="contactEmail" label="Contact email">
        <Input id="contactEmail" name="contactEmail" type="email" defaultValue={site?.contact_email ?? ""} />
      </FormField>
      <FormField id="contactPhone" label="Contact phone">
        <Input id="contactPhone" name="contactPhone" defaultValue={site?.contact_phone ?? ""} />
      </FormField>
      <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
        <Label htmlFor="maintenanceMode" className="text-sm font-normal">
          Maintenance mode
        </Label>
        <Switch id="maintenanceMode" checked={maintenance} onCheckedChange={setMaintenance} />
        <input type="checkbox" name="maintenanceMode" checked={maintenance} readOnly hidden />
      </div>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-primary">Saved.</p> : null}
      <SubmitButton>Save site settings</SubmitButton>
    </form>
  );
}

function StoreForm({ store }: { store: Settings["store"] }) {
  const [state, formAction] = useActionState(saveStoreSettingsAction, initialState);

  return (
    <form action={formAction} className="space-y-4 pt-4">
      <FormField id="orderNumberPrefix" label="Order number prefix" required>
        <Input id="orderNumberPrefix" name="orderNumberPrefix" defaultValue={store?.order_number_prefix ?? "DXB"} required />
      </FormField>
      <FormField id="whatsappNumber" label="WhatsApp number">
        <Input id="whatsappNumber" name="whatsappNumber" defaultValue={store?.whatsapp_number ?? ""} />
      </FormField>
      <FormField id="supportEmail" label="Support email">
        <Input id="supportEmail" name="supportEmail" type="email" defaultValue={store?.support_email ?? ""} />
      </FormField>
      <FormField id="supportPhone" label="Support phone">
        <Input id="supportPhone" name="supportPhone" defaultValue={store?.support_phone ?? ""} />
      </FormField>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-primary">Saved.</p> : null}
      <SubmitButton>Save store settings</SubmitButton>
    </form>
  );
}

function DeliveryForm({ delivery }: { delivery: Settings["delivery"] }) {
  const [state, formAction] = useActionState(saveDeliverySettingsAction, initialState);

  return (
    <form action={formAction} className="space-y-4 pt-4">
      <PriceInput
        id="freeDeliveryThreshold"
        name="freeDeliveryThreshold"
        label="Free delivery threshold"
        defaultValue={delivery?.free_delivery_threshold}
      />
      <PriceInput
        id="defaultDeliveryFee"
        name="defaultDeliveryFee"
        label="Default delivery fee"
        defaultValue={delivery?.default_delivery_fee ?? "0"}
      />
      <FormField id="sameDayCutoffTime" label="Same-day order cutoff time">
        <Input
          id="sameDayCutoffTime"
          name="sameDayCutoffTime"
          type="time"
          defaultValue={delivery?.same_day_cutoff_time?.slice(0, 5) ?? ""}
        />
      </FormField>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-primary">Saved.</p> : null}
      <SubmitButton>Save delivery settings</SubmitButton>
    </form>
  );
}

function PaymentForm({ payment }: { payment: Settings["payment"] }) {
  const [state, formAction] = useActionState(savePaymentSettingsAction, initialState);
  const [cod, setCod] = useState(payment?.cod_enabled ?? true);
  const [card, setCard] = useState(payment?.card_enabled ?? true);
  const [testMode, setTestMode] = useState(payment?.test_mode ?? true);

  return (
    <form action={formAction} className="space-y-4 pt-4">
      <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
        <Label htmlFor="codEnabled" className="text-sm font-normal">
          Cash on delivery
        </Label>
        <Switch id="codEnabled" checked={cod} onCheckedChange={setCod} />
        <input type="checkbox" name="codEnabled" checked={cod} readOnly hidden />
      </div>
      <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
        <Label htmlFor="cardEnabled" className="text-sm font-normal">
          Card payments
        </Label>
        <Switch id="cardEnabled" checked={card} onCheckedChange={setCard} />
        <input type="checkbox" name="cardEnabled" checked={card} readOnly hidden />
      </div>
      <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
        <Label htmlFor="testMode" className="text-sm font-normal">
          Test mode
        </Label>
        <Switch id="testMode" checked={testMode} onCheckedChange={setTestMode} />
        <input type="checkbox" name="testMode" checked={testMode} readOnly hidden />
      </div>
      <p className="text-xs text-muted-foreground">
        Payment provider integration (Stripe, Tabby, etc.) is configured at the service layer in a
        later phase — this only controls which methods are offered at checkout.
      </p>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-primary">Saved.</p> : null}
      <SubmitButton>Save payment settings</SubmitButton>
    </form>
  );
}

function SocialLinksManager({ links }: { links: Settings["socialLinks"] }) {
  const [state, formAction] = useActionState(saveSocialLinkAction, initialState);

  return (
    <div className="space-y-6 pt-4">
      <div className="space-y-2">
        {links.length === 0 ? (
          <p className="text-sm text-muted-foreground">No social links yet.</p>
        ) : (
          links.map((link) => (
            <div key={link.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
              <span className="capitalize">{link.platform}</span>
              <span className="truncate text-muted-foreground">{link.url}</span>
              <Button
                type="button"
                size="xs"
                variant="destructive"
                onClick={() => deleteSocialLinkAction(link.id)}
              >
                Remove
              </Button>
            </div>
          ))
        )}
      </div>
      <form action={formAction} className="space-y-4 border-t border-border pt-4">
        <FormField id="platform" label="Platform" required>
          <select
            id="platform"
            name="platform"
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none"
          >
            {["instagram", "facebook", "tiktok", "whatsapp", "twitter", "youtube", "pinterest", "snapchat"].map(
              (platform) => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ),
            )}
          </select>
        </FormField>
        <FormField id="url" label="URL" required>
          <Input id="url" name="url" type="url" required />
        </FormField>
        {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
        <SubmitButton>Save link</SubmitButton>
      </form>
    </div>
  );
}
