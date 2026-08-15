/**
 * Static, non-editable infrastructure constants only.
 *
 * Anything a store admin should be able to change — site name, nav,
 * homepage sections, banners, product/category data — must live in the
 * database and be read through the service layer instead of added here.
 */
export const siteConfig = {
  defaultLocale: "en-AE",
  defaultCurrency: "AED",
  timeZone: "Asia/Dubai",
} as const;
