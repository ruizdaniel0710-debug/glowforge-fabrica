create type public.app_role as enum ('admin', 'user');
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;
create policy "Users read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

create table public.custom_requests (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  customer_name text not null,
  email text not null,
  notes text not null default '',
  files jsonb not null default '[]'::jsonb,
  status text not null default 'recibida',
  quote_amount integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, update on public.custom_requests to authenticated;
grant all on public.custom_requests to service_role;
alter table public.custom_requests enable row level security;
create policy "Admins read requests" on public.custom_requests for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins update requests" on public.custom_requests for update to authenticated using (public.has_role(auth.uid(), 'admin'));

create table public.request_replies (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.custom_requests(id) on delete cascade,
  message text not null,
  amount integer,
  created_at timestamptz not null default now()
);
grant select, insert on public.request_replies to authenticated;
grant all on public.request_replies to service_role;
alter table public.request_replies enable row level security;
create policy "Admins read replies" on public.request_replies for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins add replies" on public.request_replies for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));

create policy "Anyone uploads custom files" on storage.objects for insert to anon, authenticated with check (bucket_id = 'custom-uploads' and (storage.foldername(name))[1] = 'requests');
create policy "Admins read custom files" on storage.objects for select to authenticated using (bucket_id = 'custom-uploads' and public.has_role(auth.uid(), 'admin'));