# Constants

Fixed, code-level enums and literals that are part of the domain model
itself — not business content (that belongs in the database, per the CMS
requirement). Examples added as later phases need them: order status
values (`pending`, `confirmed`, `preparing`, …), payment status values,
role names. Keep these as `as const` arrays/objects with derived types,
not `enum`.
