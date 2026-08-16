-- The original "staff can read roles" policy (rbac migration) was too
-- narrow: a customer resolving their own role name (via user_roles ->
-- roles) needs to read the roles table too, not just staff. Role names
-- aren't sensitive — widen to any authenticated user, still not anon.
drop policy "staff can read roles" on public.roles;

create policy "authenticated users can read roles" on public.roles
  for select to authenticated
  using (true);
