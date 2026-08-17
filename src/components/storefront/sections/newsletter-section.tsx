"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/shared/submit-button";
import { subscribeNewsletterAction } from "@/app/newsletter/actions";
import type { ResolvedSection } from "@/services/homepage.service";

export function NewsletterSection({
  section,
}: {
  section: Extract<ResolvedSection, { type: "newsletter" }>;
}) {
  const { row } = section;
  const [state, formAction] = useActionState(subscribeNewsletterAction, {});

  return (
    <section className="bg-secondary py-16">
      <div className="mx-auto max-w-lg px-4 text-center sm:px-6 lg:px-8">
        <h2 className="font-heading text-2xl text-foreground sm:text-3xl">
          {row.heading ?? "Stay in bloom"}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {row.description ?? "Get seasonal arrangements and offers in your inbox."}
        </p>
        {state.success ? (
          <p className="mt-6 text-sm font-medium text-primary">You&apos;re subscribed — thank you!</p>
        ) : (
          <form action={formAction} className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Input
              type="email"
              name="email"
              placeholder="Your email address"
              required
              className="flex-1"
            />
            <SubmitButton>Subscribe</SubmitButton>
          </form>
        )}
        {state.error ? <p className="mt-2 text-sm text-destructive">{state.error}</p> : null}
      </div>
    </section>
  );
}
