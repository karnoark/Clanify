create type "public"."admin_verification_status" as enum ('pending_onboarding', 'onboarding_in_progress', 'verification_pending', 'approved', 'rejected');

create type "public"."email_status" as enum ('available', 'exists_in_profiles', 'exists_in_admin_registrations');

create type "public"."membership_request_status" as enum ('pending', 'approved', 'rejected', 'cancelled');

create type "public"."membership_status" as enum ('active', 'expired', 'cancelled');

create type "public"."mess_type" as enum ('veg', 'non-veg', 'both');

create type "public"."onboarding_step" as enum ('mess_details', 'location_details', 'contact_details', 'timing_details', 'media_files');

create type "public"."point_transaction_type" as enum ('EARNED_ABSENCE', 'EARNED_CLOSURE', 'EARNED_ADMIN', 'USED_RENEWAL', 'USED_ADMIN');

create type "public"."user_role" as enum ('admin', 'member', 'admin_verification_pending', 'regular');

create table "public"."admin_registrations" (
    "id" uuid not null,
    "email" text not null,
    "first_name" text not null,
    "last_name" text not null,
    "status" admin_verification_status default 'pending_onboarding'::admin_verification_status,
    "current_onboarding_step" onboarding_step default 'mess_details'::onboarding_step,
    "mess_details" jsonb,
    "location_details" jsonb,
    "contact_details" jsonb,
    "timing_details" jsonb,
    "media_files" jsonb,
    "created_at" timestamp with time zone default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone default timezone('utc'::text, now()),
    "submitted_at" timestamp with time zone,
    "verification_notes" text
);


alter table "public"."admin_registrations" enable row level security;

create table "public"."membership_plans" (
    "id" uuid not null default uuid_generate_v4(),
    "mess_id" uuid,
    "name" text not null,
    "membership_period" integer not null,
    "price" numeric(10,2) not null,
    "description" text,
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now()
);


alter table "public"."membership_plans" enable row level security;

create table "public"."membership_requests" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid not null,
    "mess_id" uuid not null,
    "plan_id" uuid not null,
    "requested_start_date" date not null,
    "status" membership_request_status not null default 'pending'::membership_request_status,
    "admin_notes" text,
    "responded_at" timestamp with time zone,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "points_used" integer,
    "final_price" numeric(10,2),
    "points_days_added" integer
);


alter table "public"."membership_requests" enable row level security;

create table "public"."memberships" (
    "id" uuid not null default uuid_generate_v4(),
    "member_id" uuid not null,
    "mess_id" uuid not null,
    "plan_id" uuid not null,
    "start_date" date not null,
    "expiry_date" date not null,
    "points" integer default 0,
    "status" membership_status not null default 'active'::membership_status,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
);


alter table "public"."memberships" enable row level security;

create table "public"."messes" (
    "id" uuid not null default gen_random_uuid(),
    "admin_id" uuid not null,
    "name" text not null,
    "description" text,
    "type" mess_type not null default 'both'::mess_type,
    "capacity" integer not null,
    "monthly_rate" numeric not null,
    "security_deposit" numeric,
    "street" text not null,
    "area" text,
    "city" text not null,
    "state" text not null,
    "pincode" text,
    "coordinates" point,
    "phone" text not null,
    "alternate_phone" text,
    "email" text not null,
    "website" text,
    "timings" jsonb not null,
    "photos" jsonb,
    "specialties" text[],
    "establishment_year" text,
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter table "public"."messes" enable row level security;

create table "public"."points_redemptions" (
    "id" uuid not null default gen_random_uuid(),
    "membership_request_id" uuid not null,
    "points_used" integer not null,
    "days_added" integer not null,
    "created_at" timestamp with time zone not null default now(),
    "created_by" uuid not null
);


create table "public"."points_transactions" (
    "id" uuid not null default gen_random_uuid(),
    "membership_id" uuid not null,
    "points" integer not null,
    "transaction_type" point_transaction_type not null,
    "reason" text,
    "reference_id" uuid,
    "created_at" timestamp with time zone not null default now(),
    "created_by" uuid not null
);


create table "public"."profiles" (
    "id" uuid not null,
    "first_name" text,
    "last_name" text,
    "role" user_role default 'regular'::user_role,
    "phone_number" text,
    "updated_at" timestamp without time zone default now()
);


alter table "public"."profiles" enable row level security;

CREATE UNIQUE INDEX admin_registrations_email_key ON public.admin_registrations USING btree (email);

CREATE UNIQUE INDEX admin_registrations_pkey ON public.admin_registrations USING btree (id);

CREATE INDEX idx_messes_admin_id ON public.messes USING btree (admin_id);

CREATE INDEX idx_messes_city ON public.messes USING btree (city);

CREATE INDEX idx_messes_location ON public.messes USING gist (coordinates);

CREATE INDEX idx_messes_type ON public.messes USING btree (type);

CREATE INDEX idx_points_transactions_created_at ON public.points_transactions USING btree (created_at);

CREATE INDEX idx_points_transactions_membership ON public.points_transactions USING btree (membership_id);

CREATE UNIQUE INDEX membership_plans_pkey ON public.membership_plans USING btree (id);

CREATE UNIQUE INDEX membership_requests_pkey ON public.membership_requests USING btree (id);

CREATE UNIQUE INDEX memberships_pkey ON public.memberships USING btree (id);

CREATE UNIQUE INDEX messes_pkey ON public.messes USING btree (id);

CREATE UNIQUE INDEX points_redemptions_pkey ON public.points_redemptions USING btree (id);

CREATE UNIQUE INDEX points_transactions_pkey ON public.points_transactions USING btree (id);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX single_active_membership_per_user ON public.memberships USING btree (member_id) WHERE (status = 'active'::membership_status);

CREATE UNIQUE INDEX unique_pending_request ON public.membership_requests USING btree (user_id, mess_id) WHERE (status = 'pending'::membership_request_status);

CREATE UNIQUE INDEX unique_request_redemption ON public.points_redemptions USING btree (membership_request_id);

alter table "public"."admin_registrations" add constraint "admin_registrations_pkey" PRIMARY KEY using index "admin_registrations_pkey";

alter table "public"."membership_plans" add constraint "membership_plans_pkey" PRIMARY KEY using index "membership_plans_pkey";

alter table "public"."membership_requests" add constraint "membership_requests_pkey" PRIMARY KEY using index "membership_requests_pkey";

alter table "public"."memberships" add constraint "memberships_pkey" PRIMARY KEY using index "memberships_pkey";

alter table "public"."messes" add constraint "messes_pkey" PRIMARY KEY using index "messes_pkey";

alter table "public"."points_redemptions" add constraint "points_redemptions_pkey" PRIMARY KEY using index "points_redemptions_pkey";

alter table "public"."points_transactions" add constraint "points_transactions_pkey" PRIMARY KEY using index "points_transactions_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."admin_registrations" add constraint "admin_registrations_email_key" UNIQUE using index "admin_registrations_email_key";

alter table "public"."admin_registrations" add constraint "admin_registrations_id_fkey" FOREIGN KEY (id) REFERENCES profiles(id) ON DELETE CASCADE not valid;

alter table "public"."admin_registrations" validate constraint "admin_registrations_id_fkey";

alter table "public"."membership_plans" add constraint "membership_plans_mess_id_fkey" FOREIGN KEY (mess_id) REFERENCES messes(id) not valid;

alter table "public"."membership_plans" validate constraint "membership_plans_mess_id_fkey";

alter table "public"."membership_plans" add constraint "valid_days_check" CHECK ((membership_period > 0)) not valid;

alter table "public"."membership_plans" validate constraint "valid_days_check";

alter table "public"."membership_requests" add constraint "membership_requests_final_price_check" CHECK ((final_price >= (0)::numeric)) not valid;

alter table "public"."membership_requests" validate constraint "membership_requests_final_price_check";

alter table "public"."membership_requests" add constraint "membership_requests_mess_id_fkey" FOREIGN KEY (mess_id) REFERENCES messes(id) not valid;

alter table "public"."membership_requests" validate constraint "membership_requests_mess_id_fkey";

alter table "public"."membership_requests" add constraint "membership_requests_plan_id_fkey" FOREIGN KEY (plan_id) REFERENCES membership_plans(id) not valid;

alter table "public"."membership_requests" validate constraint "membership_requests_plan_id_fkey";

alter table "public"."membership_requests" add constraint "membership_requests_points_days_added_check" CHECK ((points_days_added >= 0)) not valid;

alter table "public"."membership_requests" validate constraint "membership_requests_points_days_added_check";

alter table "public"."membership_requests" add constraint "membership_requests_points_used_check" CHECK ((points_used >= 0)) not valid;

alter table "public"."membership_requests" validate constraint "membership_requests_points_used_check";

alter table "public"."membership_requests" add constraint "membership_requests_user_id_fkey" FOREIGN KEY (user_id) REFERENCES profiles(id) not valid;

alter table "public"."membership_requests" validate constraint "membership_requests_user_id_fkey";

alter table "public"."membership_requests" add constraint "valid_start_date" CHECK ((requested_start_date >= CURRENT_DATE)) not valid;

alter table "public"."membership_requests" validate constraint "valid_start_date";

alter table "public"."memberships" add constraint "valid_dates_check" CHECK ((expiry_date >= start_date)) not valid;

alter table "public"."memberships" validate constraint "valid_dates_check";

alter table "public"."messes" add constraint "messes_admin_id_fkey" FOREIGN KEY (admin_id) REFERENCES profiles(id) not valid;

alter table "public"."messes" validate constraint "messes_admin_id_fkey";

alter table "public"."messes" add constraint "messes_capacity_check" CHECK ((capacity > 0)) not valid;

alter table "public"."messes" validate constraint "messes_capacity_check";

alter table "public"."messes" add constraint "messes_monthly_rate_check" CHECK ((monthly_rate > (0)::numeric)) not valid;

alter table "public"."messes" validate constraint "messes_monthly_rate_check";

alter table "public"."points_redemptions" add constraint "points_redemptions_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."points_redemptions" validate constraint "points_redemptions_created_by_fkey";

alter table "public"."points_redemptions" add constraint "points_redemptions_days_added_check" CHECK ((days_added > 0)) not valid;

alter table "public"."points_redemptions" validate constraint "points_redemptions_days_added_check";

alter table "public"."points_redemptions" add constraint "points_redemptions_membership_request_id_fkey" FOREIGN KEY (membership_request_id) REFERENCES membership_requests(id) not valid;

alter table "public"."points_redemptions" validate constraint "points_redemptions_membership_request_id_fkey";

alter table "public"."points_redemptions" add constraint "points_redemptions_points_used_check" CHECK ((points_used > 0)) not valid;

alter table "public"."points_redemptions" validate constraint "points_redemptions_points_used_check";

alter table "public"."points_redemptions" add constraint "unique_request_redemption" UNIQUE using index "unique_request_redemption";

alter table "public"."points_transactions" add constraint "points_transactions_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."points_transactions" validate constraint "points_transactions_created_by_fkey";

alter table "public"."points_transactions" add constraint "points_transactions_membership_id_fkey" FOREIGN KEY (membership_id) REFERENCES memberships(id) not valid;

alter table "public"."points_transactions" validate constraint "points_transactions_membership_id_fkey";

alter table "public"."points_transactions" add constraint "valid_points_for_type" CHECK (
CASE
    WHEN (transaction_type = ANY (ARRAY['EARNED_ABSENCE'::point_transaction_type, 'EARNED_CLOSURE'::point_transaction_type, 'EARNED_ADMIN'::point_transaction_type])) THEN (points > 0)
    WHEN (transaction_type = ANY (ARRAY['USED_RENEWAL'::point_transaction_type, 'USED_ADMIN'::point_transaction_type])) THEN (points < 0)
    ELSE false
END) not valid;

alter table "public"."points_transactions" validate constraint "valid_points_for_type";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

set check_function_bodies = off;

create or replace view "public"."active_messes_view" as  SELECT m.id,
    m.admin_id,
    m.name,
    m.description,
    m.type,
    m.capacity,
    m.monthly_rate,
    m.security_deposit,
    m.street AS address,
    m.area,
    m.city,
    m.state,
    m.pincode,
    m.coordinates,
    m.phone,
    m.alternate_phone,
    m.email,
    m.website,
    m.timings,
    m.photos,
    m.specialties,
    m.establishment_year,
    m.is_active,
    m.created_at,
    m.updated_at,
    p.first_name AS admin_first_name,
    p.last_name AS admin_last_name
   FROM (messes m
     JOIN profiles p ON ((m.admin_id = p.id)))
  WHERE (m.is_active = true);


CREATE OR REPLACE FUNCTION public.add_points_transaction(p_membership_id uuid, p_points integer, p_transaction_type point_transaction_type, p_reason text, p_reference_id uuid, p_created_by uuid)
 RETURNS points_transactions
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    new_transaction points_transactions;
BEGIN
    -- Start transaction block
    BEGIN
        -- Insert the new transaction
        INSERT INTO points_transactions (
            membership_id,
            points,
            transaction_type,
            reason,
            reference_id,
            created_by
        )
        VALUES (
            p_membership_id,
            p_points,
            p_transaction_type,
            p_reason,
            p_reference_id,
            p_created_by
        )
        RETURNING * INTO new_transaction;

        -- Update the points in memberships table
        UPDATE memberships
        SET points = get_membership_points(p_membership_id)
        WHERE id = p_membership_id;

        -- Commit if everything is successful
        RETURN new_transaction;

    EXCEPTION
        WHEN OTHERS THEN
            -- Rollback on any error
            RAISE NOTICE 'Transaction failed: %', SQLERRM;
            ROLLBACK;
            RETURN NULL;  -- Return NULL to indicate failure
    END;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.approve_membership_request(p_request_id uuid, p_admin_notes text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_request membership_requests%ROWTYPE;  -- Use %ROWTYPE for type safety
    v_membership_id UUID;
    v_existing_membership memberships%ROWTYPE;
BEGIN
    -- Validate input
    IF p_request_id IS NULL THEN
        RAISE EXCEPTION 'Request ID cannot be null';
    END IF;

    -- Get and lock the request for processing
    -- FOR UPDATE ensures no other process can modify this row while we're working with it
    SELECT * INTO v_request
    FROM membership_requests
    WHERE id = p_request_id
    AND status = 'pending'
    FOR UPDATE;  -- Lock the row

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Request not found or not in pending status';
    END IF;

    -- Verify admin has permission for this mess
    -- This uses auth.uid() which is provided by Supabase for the current user
    IF NOT EXISTS (
        SELECT 1 FROM messes 
        WHERE id = v_request.mess_id 
        AND admin_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Unauthorized to approve requests for this mess';
    END IF;

    -- Check for any active membership again (race condition protection)
    SELECT * INTO v_existing_membership
    FROM memberships
    WHERE member_id = v_request.user_id
    AND mess_id = v_request.mess_id
    AND status = 'active'
    AND expiry_date >= CURRENT_DATE;

    IF FOUND THEN
        RAISE EXCEPTION 'Member already has an active membership';
    END IF;

    -- Create new membership
    -- Instead of using SAVEPOINT, we'll use exception handling
    BEGIN
        v_membership_id := create_membership(
            v_request.user_id,
            v_request.mess_id,
            v_request.plan_id,
            v_request.requested_start_date
        );
    EXCEPTION 
        WHEN OTHERS THEN
            -- If anything goes wrong during membership creation,
            -- we'll catch the error and raise it with additional context
            RAISE EXCEPTION 'Failed to create membership: %', SQLERRM;
    END;

    -- Update request status
    -- This only happens if membership creation was successful
    UPDATE membership_requests
    SET 
        status = 'approved',
        admin_notes = p_admin_notes,
        responded_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_request_id;

    RETURN v_membership_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.approve_mess_registration(registration_id uuid, approval_notes text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_registration RECORD;
    v_mess_id UUID;
BEGIN
    -- First, lock and validate the registration
    SELECT 
        ar.id,
        ar.email,
        ar.status,
        ar.mess_details,
        ar.location_details,
        ar.contact_details,
        ar.timing_details,
        ar.media_files
    INTO v_registration
    FROM admin_registrations ar
    WHERE ar.id = registration_id
    FOR UPDATE;  -- Lock the row to prevent concurrent modifications

    -- Validate registration exists and is in correct state
    IF v_registration.id IS NULL THEN
        RAISE EXCEPTION 'Registration not found';
    END IF;

    IF v_registration.status != 'verification_pending' THEN
        RAISE EXCEPTION 'Registration is not in verification_pending state. Current state: %', v_registration.status;
    END IF;

    -- Validate required data is present
    IF v_registration.mess_details IS NULL OR 
       v_registration.location_details IS NULL OR 
       v_registration.contact_details IS NULL OR 
       v_registration.timing_details IS NULL THEN
        RAISE EXCEPTION 'Registration data is incomplete';
    END IF;

    -- Begin transaction for all updates
    BEGIN
        -- 1. Update auth.users metadata
        UPDATE auth.users 
        SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('role', 'admin')
        WHERE id = registration_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Failed to update user metadata';
        END IF;

        -- 2. Update profile role
        UPDATE profiles 
        SET 
            role = 'admin',
            updated_at = now()
        WHERE id = registration_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Failed to update profile role';
        END IF;

        -- 3. Create mess entry
        INSERT INTO messes (
            id,
            admin_id,
            name,
            description,
            type,
            capacity,
            monthly_rate,
            security_deposit,
            street,
            area,
            city,
            state,
            pincode,
            coordinates,
            phone,
            alternate_phone,
            email,
            website,
            timings,
            photos,
            specialties,
            establishment_year
        )
        SELECT 
            gen_random_uuid(),  -- Generate new UUID for mess
            registration_id,    -- Admin ID is the registration ID
            (md->>'name')::text,
            (md->>'description')::text,
            (md->>'type')::mess_type,
            (md->>'capacity')::integer,
            (md->>'monthlyRate')::decimal,
            (md->>'securityDeposit')::decimal,
            (ld->'address'->>'street')::text,     -- Fix: Correct JSON path for nested address
            (ld->'address'->>'area')::text,       -- Fix: Correct JSON path for nested address
            (ld->'address'->>'city')::text,       -- Fix: Correct JSON path for nested address
            (ld->'address'->>'state')::text,      -- Fix: Correct JSON path for nested address
            (ld->'address'->>'pincode')::text, 
            point(
                (ld->'coordinates'->>'latitude')::float,
                (ld->'coordinates'->>'longitude')::float
            ),
            (cd->>'phone')::text,
            (cd->>'alternatePhone')::text,
            (cd->>'email')::text,
            (cd->>'website')::text,
            td,  -- timing_details is already JSONB
            mf->'photos',
            ARRAY(
                SELECT jsonb_array_elements_text(md->'specialties')
            ),
            (md->>'establishmentYear')::text
        FROM (
            SELECT 
                v_registration.mess_details AS md,
                v_registration.location_details AS ld,
                v_registration.contact_details AS cd,
                v_registration.timing_details AS td,
                v_registration.media_files AS mf
        ) AS data
        RETURNING id INTO v_mess_id;

        IF v_mess_id IS NULL THEN
            RAISE EXCEPTION 'Failed to create mess entry';
        END IF;

        -- 4. Update registration status
        UPDATE admin_registrations
        SET 
            status = 'approved',
            verification_notes = approval_notes,
            updated_at = now()
        WHERE id = registration_id;

        -- Return the newly created mess ID
        RETURN v_mess_id;

    EXCEPTION WHEN OTHERS THEN
        -- Log the error (you might want to add proper error logging)
        RAISE NOTICE 'Error in approval process: %', SQLERRM;
        -- Re-raise the error
        RAISE;
    END;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.approve_renewal_request(p_request_id uuid, p_admin_id uuid, p_admin_notes text DEFAULT NULL::text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_request membership_requests;
    v_membership memberships;
    v_new_membership_id UUID;
    v_points_transaction_id UUID;
    v_is_admin_authorized BOOLEAN;
    v_expiry_date DATE;
BEGIN
    -- Verify admin authorization
    SELECT EXISTS (
        SELECT 1 
        FROM messes m 
        JOIN membership_requests mr ON m.id = mr.mess_id
        WHERE mr.id = p_request_id 
        AND m.admin_id = p_admin_id
    ) INTO v_is_admin_authorized;

    IF NOT v_is_admin_authorized THEN
        RAISE EXCEPTION 'Unauthorized admin access';
    END IF;

    -- Get request details with validation
    SELECT * INTO v_request 
    FROM membership_requests 
    WHERE id = p_request_id AND status = 'pending';

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid or non-pending request';
    END IF;
    
    -- Get latest membership (if exists) for points calculation
    SELECT * INTO v_membership
    FROM memberships 
    WHERE member_id = v_request.user_id 
    AND mess_id = v_request.mess_id
    ORDER BY expiry_date DESC
    LIMIT 1;


    -- Begin transaction
    BEGIN
        -- Handle points redemption if points are being used
        IF v_request.points_used > 0 THEN
            -- Verify points availability
            IF v_membership.points < v_request.points_used THEN
                RAISE EXCEPTION 'Insufficient points. Available: %, Required: %',
                    v_membership.points, v_request.points_used;
            END IF;

            -- Create points redemption record
            INSERT INTO points_redemptions (
                membership_request_id,
                points_used,
                days_added,
                created_by
            ) VALUES (
                p_request_id,
                v_request.points_used,
                v_request.points_days_added,
                p_admin_id
            );

            -- Create points transaction
            INSERT INTO points_transactions (
                membership_id,
                points,
                transaction_type,
                reason,
                reference_id,
                created_by
            ) VALUES (
                v_membership.id,
                -v_request.points_used,
                'USED_RENEWAL',
                'Points used for membership renewal',
                p_request_id,
                p_admin_id
            ) RETURNING id INTO v_points_transaction_id;
        END IF;

        -- Calculate expiry date (wrapped in exception handling)
        BEGIN
            SELECT calculate_expiry_date(
                v_request.requested_start_date,
                v_request.plan_id,
                v_request.points_days_added
            ) INTO v_expiry_date;
        EXCEPTION WHEN OTHERS THEN
            RAISE EXCEPTION 'Failed to calculate expiry date: %', SQLERRM;
        END;

        -- Create new membership (fixed syntax)
        INSERT INTO memberships (
            member_id,
            mess_id,
            plan_id,
            start_date,
            expiry_date,
            points,
            status
        ) VALUES (
            v_request.user_id,
            v_request.mess_id,
            v_request.plan_id,
            v_request.requested_start_date,
            v_expiry_date,
            v_membership.points - COALESCE(v_request.points_used, 0),
            'active'
        ) RETURNING id INTO v_new_membership_id;

        -- Update old membership status (with condition)
        UPDATE memberships 
        SET status = 'expired' 
        WHERE id = v_membership.id
        AND status != 'expired';

        -- Update request status
        UPDATE membership_requests 
        SET 
            status = 'approved',
            responded_at = now(),
            admin_notes = p_admin_notes
        WHERE id = p_request_id;

        -- Return success response
        RETURN json_build_object(
            'success', true,
            'new_membership_id', v_new_membership_id,
            'points_transaction_id', v_points_transaction_id,
            'message', 'Renewal request approved successfully'
        );

    EXCEPTION 
        WHEN OTHERS THEN
            -- Log error details if needed
            RAISE EXCEPTION 'Failed to process renewal request: %', SQLERRM;
    END;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.calculate_expiry_date(p_start_date date, p_plan_id uuid, p_points_days_added integer DEFAULT 0)
 RETURNS date
 LANGUAGE plpgsql
 STABLE
AS $function$
BEGIN
    RETURN p_start_date + 
           (SELECT membership_period FROM membership_plans WHERE id = p_plan_id)::INTEGER + 
           COALESCE(p_points_days_added, 0);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.calculate_points_benefit(p_points integer)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    days_per_100_points INTEGER := 1;
    usable_points INTEGER;
    extra_days INTEGER;
    remaining_points INTEGER;
BEGIN
		-- Input validation
    IF p_points < 0 THEN
        RAISE EXCEPTION 'Points cannot be negative';
    END IF;

    -- Calculate how many points can be used (must be multiples of 100)
    usable_points := (p_points / 100) * 100;
    
    -- Calculate extra days and remaining points
    extra_days := usable_points / 100 * days_per_100_points;
    remaining_points := p_points - usable_points;
    
    RETURN json_build_object(
        'usable_points', usable_points,
        'extra_days', extra_days,
        'remaining_points', remaining_points
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.check_email_availability(check_email text)
 RETURNS email_status
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$DECLARE
    status email_status;
BEGIN
    -- First check profiles table
    IF EXISTS (
        SELECT 1 FROM auth.users 
        WHERE email = check_email
    ) THEN
        RETURN 'exists_in_profiles';
    END IF;

    -- Then check admin_registrations table
    IF EXISTS (
        SELECT 1 FROM admin_registrations 
        WHERE email = check_email
    ) THEN
        RETURN 'exists_in_admin_registrations';
    END IF;

    -- If we get here, email is available
    RETURN 'available';
END;$function$
;

CREATE OR REPLACE FUNCTION public.create_membership(p_member_id uuid, p_mess_id uuid, p_plan_id uuid, p_start_date date)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_plan membership_plans%ROWTYPE;  -- Use %ROWTYPE for better type safety
    v_membership_id UUID;
    v_previous_membership memberships%ROWTYPE;
    v_reward_points INTEGER;
BEGIN
    -- Input validation
    IF p_member_id IS NULL OR p_mess_id IS NULL OR p_plan_id IS NULL OR p_start_date IS NULL THEN
        RAISE EXCEPTION 'All parameters are required';
    END IF;

    -- Get and validate plan
    SELECT * INTO v_plan 
    FROM membership_plans 
    WHERE id = p_plan_id 
    AND mess_id = p_mess_id 
    AND is_active = true;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid or inactive plan';
    END IF;

    -- Get previous membership to handle reward points
    SELECT * INTO v_previous_membership
    FROM memberships
    WHERE member_id = p_member_id
    AND mess_id = p_mess_id
    AND status = 'expired'
    ORDER BY expiry_date DESC
    LIMIT 1;

    -- Calculate reward points to transfer
    v_reward_points := COALESCE(v_previous_membership.points, 0);
    
    -- Create new membership
    INSERT INTO memberships (
        id,
        member_id,
        mess_id,
        plan_id,
        start_date,
        expiry_date,
        points,
        status,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid(),
        p_member_id,
        p_mess_id,
        p_plan_id,
        p_start_date,
        p_start_date + (v_plan.membership_period || ' days')::INTERVAL,
        v_reward_points,
        'active',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    ) RETURNING id INTO v_membership_id;

    -- If transferring points, reset previous membership's points
    IF v_previous_membership.id IS NOT NULL AND v_reward_points > 0 THEN
        UPDATE memberships
        SET points = 0,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = v_previous_membership.id;
    END IF;
    
    RETURN v_membership_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_membership_request(p_member_id uuid, p_mess_id uuid, p_plan_id uuid, p_start_date date)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_request_id UUID;
    v_current_membership memberships%ROWTYPE;
    v_plan membership_plans%ROWTYPE;
BEGIN
    -- Input validation
    IF p_member_id IS NULL OR p_mess_id IS NULL OR p_plan_id IS NULL OR p_start_date IS NULL THEN
        RAISE EXCEPTION 'All parameters are required';
    END IF;

    -- Validate plan exists and belongs to the mess
    SELECT * INTO v_plan 
    FROM membership_plans 
    WHERE id = p_plan_id AND mess_id = p_mess_id AND is_active = true;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid or inactive membership plan';
    END IF;

    -- Get current membership if exists (for renewal validation)
    SELECT * INTO v_current_membership 
    FROM memberships 
    WHERE member_id = p_member_id 
    AND mess_id = p_mess_id 
    AND status = 'active'
    ORDER BY expiry_date DESC 
    LIMIT 1;

    -- For active memberships, validate renewal start date
    IF v_current_membership.id IS NOT NULL THEN
        IF v_current_membership.expiry_date >= CURRENT_DATE THEN
            RAISE EXCEPTION 'Member already has an active membership with this mess';
        END IF;
        
        -- For renewals, start date must be after current membership expiry
        IF p_start_date <= v_current_membership.expiry_date THEN
            RAISE EXCEPTION 'Renewal start date must be after current membership expiry date';
        END IF;
    END IF;

    -- Validate no pending request exists
    IF EXISTS (
        SELECT 1 FROM membership_requests
        WHERE user_id = p_member_id
        AND mess_id = p_mess_id
        AND status = 'pending'
    ) THEN
        RAISE EXCEPTION 'Member already has a pending request for this mess';
    END IF;

    -- Create request
    INSERT INTO membership_requests (
        id,                    -- Added id generation
        user_id,              -- Changed from member_id to match table structure
        mess_id,
        plan_id,
        requested_start_date,
        status,
        created_at,           -- Added timestamps
        updated_at
    ) VALUES (
        gen_random_uuid(),    -- Generate UUID for id
        p_member_id,
        p_mess_id,
        p_plan_id,
        p_start_date,
        'pending',
        CURRENT_TIMESTAMP,    -- Set creation timestamp
        CURRENT_TIMESTAMP     -- Set update timestamp
    ) RETURNING id INTO v_request_id;

    RETURN v_request_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_renewal_request(p_user_id uuid, p_mess_id uuid, p_plan_id uuid, p_requested_start_date date, p_points_to_use integer)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_membership_id UUID;
    v_current_points INTEGER;
    v_points_benefit JSON;
    v_plan_price DECIMAL(10,2);
    v_new_request_id UUID;
BEGIN
    -- Get current active membership
    SELECT id, points INTO v_membership_id, v_current_points
    FROM memberships
    WHERE member_id = p_user_id 
    AND mess_id = p_mess_id
    AND status = 'active'
    ORDER BY expiry_date DESC
    LIMIT 1;

    -- Validate points availability
    IF p_points_to_use > v_current_points THEN
        RAISE EXCEPTION 'Insufficient points. Available: %, Requested: %', 
            v_current_points, p_points_to_use;
    END IF;

    -- Get plan price
    SELECT price INTO v_plan_price
    FROM membership_plans
    WHERE id = p_plan_id;

    -- Calculate points benefit
    v_points_benefit := calculate_points_benefit(p_points_to_use);

    -- Create renewal request
    INSERT INTO membership_requests (
        id,
        user_id,
        mess_id,
        plan_id,
        requested_start_date,
        status,
        points_used,
        final_price,
        points_days_added
    )
    VALUES (
        gen_random_uuid(),
        p_user_id,
        p_mess_id,
        p_plan_id,
        p_requested_start_date,
        'pending',
        (v_points_benefit->>'usable_points')::INTEGER,
        v_plan_price,
        (v_points_benefit->>'extra_days')::INTEGER
    )
    RETURNING id INTO v_new_request_id;

    -- Return request details
    RETURN json_build_object(
        'request_id', v_new_request_id,
        'points_benefit', v_points_benefit,
        'final_price', v_plan_price
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_membership_points(membership_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN COALESCE(
        (SELECT SUM(points)
         FROM points_transactions
         WHERE membership_id = $1),
        0
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_admin_registration()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    IF NEW.role = 'admin_verification_pending'::public.user_role THEN
        INSERT INTO public.admin_registrations (
            id,            -- Now using the profile's id
            email,
            first_name,
            last_name
        ) VALUES (
            NEW.id,        -- Use the profile's id directly
            (SELECT email FROM auth.users WHERE id = NEW.id),
            NEW.first_name,
            NEW.last_name
        );
    END IF;
    
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_membership_request_response()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- If status is changing from 'pending' to 'approved' or 'rejected'
    IF OLD.status = 'pending' AND NEW.status IN ('approved', 'rejected') THEN
        -- Set responded_at to current timestamp
        NEW.responded_at = NOW();
    -- If status is changing back to 'pending'
    ELSIF NEW.status = 'pending' THEN
        -- Clear the responded_at timestamp
        NEW.responded_at = NULL;
    END IF;
    
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (
    id,
    first_name,
    last_name,
    phone_number,
    role,
    updated_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone_no', ''),
    (NEW.raw_user_meta_data->>'role')::public.user_role,  -- Explicitly cast to enum type
    NOW()
  );
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.has_active_membership(p_user_id uuid, p_mess_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM memberships 
        WHERE member_id = p_user_id 
        AND mess_id = p_mess_id 
        AND status = 'active'
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM profiles 
        WHERE id = auth.uid() 
        AND role = 'admin'
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.reject_membership_request(p_request_id uuid, p_admin_notes text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_request membership_requests%ROWTYPE;
BEGIN
    -- Input validation
    IF p_request_id IS NULL THEN
        RAISE EXCEPTION 'Request ID cannot be null';
    END IF;

    -- First, get and lock the request to ensure consistency
    SELECT * INTO v_request
    FROM membership_requests
    WHERE id = p_request_id
    AND status = 'pending'
    FOR UPDATE;  -- Lock the row

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Request not found or not in pending status';
    END IF;

    -- Verify admin has permission for this mess
    IF NOT EXISTS (
        SELECT 1 FROM messes 
        WHERE id = v_request.mess_id 
        AND admin_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Unauthorized to reject requests for this mess';
    END IF;

    -- Update request status
    UPDATE membership_requests
    SET 
        status = 'rejected',
        admin_notes = p_admin_notes,
        responded_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_request_id;

END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_mess_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Set the updated_at column to the current UTC timestamp
    NEW.updated_at = timezone('utc'::text, now());
    -- Return the modified row
    RETURN NEW;
END;
$function$
;

grant delete on table "public"."admin_registrations" to "anon";

grant insert on table "public"."admin_registrations" to "anon";

grant references on table "public"."admin_registrations" to "anon";

grant select on table "public"."admin_registrations" to "anon";

grant trigger on table "public"."admin_registrations" to "anon";

grant truncate on table "public"."admin_registrations" to "anon";

grant update on table "public"."admin_registrations" to "anon";

grant delete on table "public"."admin_registrations" to "authenticated";

grant insert on table "public"."admin_registrations" to "authenticated";

grant references on table "public"."admin_registrations" to "authenticated";

grant select on table "public"."admin_registrations" to "authenticated";

grant trigger on table "public"."admin_registrations" to "authenticated";

grant truncate on table "public"."admin_registrations" to "authenticated";

grant update on table "public"."admin_registrations" to "authenticated";

grant delete on table "public"."admin_registrations" to "service_role";

grant insert on table "public"."admin_registrations" to "service_role";

grant references on table "public"."admin_registrations" to "service_role";

grant select on table "public"."admin_registrations" to "service_role";

grant trigger on table "public"."admin_registrations" to "service_role";

grant truncate on table "public"."admin_registrations" to "service_role";

grant update on table "public"."admin_registrations" to "service_role";

grant delete on table "public"."membership_plans" to "anon";

grant insert on table "public"."membership_plans" to "anon";

grant references on table "public"."membership_plans" to "anon";

grant select on table "public"."membership_plans" to "anon";

grant trigger on table "public"."membership_plans" to "anon";

grant truncate on table "public"."membership_plans" to "anon";

grant update on table "public"."membership_plans" to "anon";

grant delete on table "public"."membership_plans" to "authenticated";

grant insert on table "public"."membership_plans" to "authenticated";

grant references on table "public"."membership_plans" to "authenticated";

grant select on table "public"."membership_plans" to "authenticated";

grant trigger on table "public"."membership_plans" to "authenticated";

grant truncate on table "public"."membership_plans" to "authenticated";

grant update on table "public"."membership_plans" to "authenticated";

grant delete on table "public"."membership_plans" to "service_role";

grant insert on table "public"."membership_plans" to "service_role";

grant references on table "public"."membership_plans" to "service_role";

grant select on table "public"."membership_plans" to "service_role";

grant trigger on table "public"."membership_plans" to "service_role";

grant truncate on table "public"."membership_plans" to "service_role";

grant update on table "public"."membership_plans" to "service_role";

grant delete on table "public"."membership_requests" to "anon";

grant insert on table "public"."membership_requests" to "anon";

grant references on table "public"."membership_requests" to "anon";

grant select on table "public"."membership_requests" to "anon";

grant trigger on table "public"."membership_requests" to "anon";

grant truncate on table "public"."membership_requests" to "anon";

grant update on table "public"."membership_requests" to "anon";

grant delete on table "public"."membership_requests" to "authenticated";

grant insert on table "public"."membership_requests" to "authenticated";

grant references on table "public"."membership_requests" to "authenticated";

grant select on table "public"."membership_requests" to "authenticated";

grant trigger on table "public"."membership_requests" to "authenticated";

grant truncate on table "public"."membership_requests" to "authenticated";

grant update on table "public"."membership_requests" to "authenticated";

grant delete on table "public"."membership_requests" to "service_role";

grant insert on table "public"."membership_requests" to "service_role";

grant references on table "public"."membership_requests" to "service_role";

grant select on table "public"."membership_requests" to "service_role";

grant trigger on table "public"."membership_requests" to "service_role";

grant truncate on table "public"."membership_requests" to "service_role";

grant update on table "public"."membership_requests" to "service_role";

grant delete on table "public"."memberships" to "anon";

grant insert on table "public"."memberships" to "anon";

grant references on table "public"."memberships" to "anon";

grant select on table "public"."memberships" to "anon";

grant trigger on table "public"."memberships" to "anon";

grant truncate on table "public"."memberships" to "anon";

grant update on table "public"."memberships" to "anon";

grant delete on table "public"."memberships" to "authenticated";

grant insert on table "public"."memberships" to "authenticated";

grant references on table "public"."memberships" to "authenticated";

grant select on table "public"."memberships" to "authenticated";

grant trigger on table "public"."memberships" to "authenticated";

grant truncate on table "public"."memberships" to "authenticated";

grant update on table "public"."memberships" to "authenticated";

grant delete on table "public"."memberships" to "service_role";

grant insert on table "public"."memberships" to "service_role";

grant references on table "public"."memberships" to "service_role";

grant select on table "public"."memberships" to "service_role";

grant trigger on table "public"."memberships" to "service_role";

grant truncate on table "public"."memberships" to "service_role";

grant update on table "public"."memberships" to "service_role";

grant delete on table "public"."messes" to "anon";

grant insert on table "public"."messes" to "anon";

grant references on table "public"."messes" to "anon";

grant select on table "public"."messes" to "anon";

grant trigger on table "public"."messes" to "anon";

grant truncate on table "public"."messes" to "anon";

grant update on table "public"."messes" to "anon";

grant delete on table "public"."messes" to "authenticated";

grant insert on table "public"."messes" to "authenticated";

grant references on table "public"."messes" to "authenticated";

grant select on table "public"."messes" to "authenticated";

grant trigger on table "public"."messes" to "authenticated";

grant truncate on table "public"."messes" to "authenticated";

grant update on table "public"."messes" to "authenticated";

grant delete on table "public"."messes" to "service_role";

grant insert on table "public"."messes" to "service_role";

grant references on table "public"."messes" to "service_role";

grant select on table "public"."messes" to "service_role";

grant trigger on table "public"."messes" to "service_role";

grant truncate on table "public"."messes" to "service_role";

grant update on table "public"."messes" to "service_role";

grant delete on table "public"."points_redemptions" to "anon";

grant insert on table "public"."points_redemptions" to "anon";

grant references on table "public"."points_redemptions" to "anon";

grant select on table "public"."points_redemptions" to "anon";

grant trigger on table "public"."points_redemptions" to "anon";

grant truncate on table "public"."points_redemptions" to "anon";

grant update on table "public"."points_redemptions" to "anon";

grant delete on table "public"."points_redemptions" to "authenticated";

grant insert on table "public"."points_redemptions" to "authenticated";

grant references on table "public"."points_redemptions" to "authenticated";

grant select on table "public"."points_redemptions" to "authenticated";

grant trigger on table "public"."points_redemptions" to "authenticated";

grant truncate on table "public"."points_redemptions" to "authenticated";

grant update on table "public"."points_redemptions" to "authenticated";

grant delete on table "public"."points_redemptions" to "service_role";

grant insert on table "public"."points_redemptions" to "service_role";

grant references on table "public"."points_redemptions" to "service_role";

grant select on table "public"."points_redemptions" to "service_role";

grant trigger on table "public"."points_redemptions" to "service_role";

grant truncate on table "public"."points_redemptions" to "service_role";

grant update on table "public"."points_redemptions" to "service_role";

grant delete on table "public"."points_transactions" to "anon";

grant insert on table "public"."points_transactions" to "anon";

grant references on table "public"."points_transactions" to "anon";

grant select on table "public"."points_transactions" to "anon";

grant trigger on table "public"."points_transactions" to "anon";

grant truncate on table "public"."points_transactions" to "anon";

grant update on table "public"."points_transactions" to "anon";

grant delete on table "public"."points_transactions" to "authenticated";

grant insert on table "public"."points_transactions" to "authenticated";

grant references on table "public"."points_transactions" to "authenticated";

grant select on table "public"."points_transactions" to "authenticated";

grant trigger on table "public"."points_transactions" to "authenticated";

grant truncate on table "public"."points_transactions" to "authenticated";

grant update on table "public"."points_transactions" to "authenticated";

grant delete on table "public"."points_transactions" to "service_role";

grant insert on table "public"."points_transactions" to "service_role";

grant references on table "public"."points_transactions" to "service_role";

grant select on table "public"."points_transactions" to "service_role";

grant trigger on table "public"."points_transactions" to "service_role";

grant truncate on table "public"."points_transactions" to "service_role";

grant update on table "public"."points_transactions" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

create policy "Allow all registrations"
on "public"."admin_registrations"
as permissive
for insert
to public
with check (true);


create policy "Update own registration"
on "public"."admin_registrations"
as permissive
for update
to public
using (true);


create policy "View own registration"
on "public"."admin_registrations"
as permissive
for select
to public
using (true);


create policy "manage_membership_plans"
on "public"."membership_plans"
as permissive
for all
to authenticated
using ((is_admin() AND (mess_id IN ( SELECT messes.id
   FROM messes
  WHERE (messes.admin_id = auth.uid())))))
with check ((is_admin() AND (mess_id IN ( SELECT messes.id
   FROM messes
  WHERE (messes.admin_id = auth.uid())))));


create policy "view_membership_plans"
on "public"."membership_plans"
as permissive
for select
to authenticated
using (((is_active = true) OR (is_admin() AND (mess_id IN ( SELECT messes.id
   FROM messes
  WHERE (messes.admin_id = auth.uid()))))));


create policy "create_requests"
on "public"."membership_requests"
as permissive
for insert
to authenticated
with check (((NOT is_admin()) AND (user_id = auth.uid()) AND (status = 'pending'::membership_request_status)));


create policy "view_own_requests"
on "public"."membership_requests"
as permissive
for select
to authenticated
using (((user_id = auth.uid()) OR (is_admin() AND (mess_id IN ( SELECT messes.id
   FROM messes
  WHERE (messes.admin_id = auth.uid()))))));


create policy "create_memberships"
on "public"."memberships"
as permissive
for insert
to authenticated
with check ((is_admin() AND (mess_id IN ( SELECT messes.id
   FROM messes
  WHERE (messes.admin_id = auth.uid()))) AND (NOT (EXISTS ( SELECT 1
   FROM memberships m2
  WHERE ((m2.member_id = memberships.member_id) AND (m2.mess_id = memberships.mess_id) AND (m2.status = 'active'::membership_status)))))));


create policy "delete_memberships"
on "public"."memberships"
as permissive
for delete
to authenticated
using ((is_admin() AND (mess_id IN ( SELECT messes.id
   FROM messes
  WHERE (messes.admin_id = auth.uid()))) AND (status = ANY (ARRAY['cancelled'::membership_status, 'expired'::membership_status]))));


create policy "update_memberships"
on "public"."memberships"
as permissive
for update
to authenticated
using (((is_admin() AND (mess_id IN ( SELECT messes.id
   FROM messes
  WHERE (messes.admin_id = auth.uid())))) OR (member_id = auth.uid())))
with check (((is_admin() AND (mess_id IN ( SELECT messes.id
   FROM messes
  WHERE (messes.admin_id = auth.uid())))) OR (member_id = auth.uid())));


create policy "view_memberships"
on "public"."memberships"
as permissive
for select
to authenticated
using (((member_id = auth.uid()) OR (is_admin() AND (mess_id IN ( SELECT messes.id
   FROM messes
  WHERE (messes.admin_id = auth.uid()))))));


create policy "Admins can update their own mess"
on "public"."messes"
as permissive
for update
to public
using ((admin_id = auth.uid()));


create policy "Admins can view their own mess"
on "public"."messes"
as permissive
for select
to public
using ((admin_id = auth.uid()));


create policy "Members can view active messes"
on "public"."messes"
as permissive
for select
to public
using ((is_active = true));


create policy "Enable insert for profiles"
on "public"."profiles"
as permissive
for insert
to public
with check (true);


create policy "Prevent profile deletion"
on "public"."profiles"
as permissive
for delete
to public
using (false);


create policy "Users can update own profile"
on "public"."profiles"
as permissive
for update
to public
using ((auth.uid() = id))
with check ((auth.uid() = id));


create policy "View profiles policy"
on "public"."profiles"
as permissive
for select
to public
using (((auth.uid() = id) OR (EXISTS ( SELECT 1
   FROM profiles p
  WHERE ((p.id = auth.uid()) AND (p.role = 'admin'::user_role))))));


CREATE TRIGGER update_admin_registrations_updated_at BEFORE UPDATE ON public.admin_registrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_membership_request_response_time BEFORE UPDATE ON public.membership_requests FOR EACH ROW EXECUTE FUNCTION handle_membership_request_response();

CREATE TRIGGER update_membership_requests_updated_at BEFORE UPDATE ON public.membership_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memberships_updated_at BEFORE UPDATE ON public.memberships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messes_updated_at BEFORE UPDATE ON public.messes FOR EACH ROW EXECUTE FUNCTION update_mess_updated_at();

CREATE TRIGGER on_admin_profile_created AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION handle_admin_registration();


