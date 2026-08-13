--
-- PostgreSQL database dump
--

\restrict qWqnhP23hIBCuZpdISMaMpFvLW1wRgS3ilcak4X8alwYpwUEHJDlILbdus16PPc

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: asset_assignments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asset_assignments (
    id integer NOT NULL,
    asset_tag character varying(15),
    employee_id character varying(10),
    assigned_date date NOT NULL,
    returned_date date
);


ALTER TABLE public.asset_assignments OWNER TO postgres;

--
-- Name: asset_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.asset_assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.asset_assignments_id_seq OWNER TO postgres;

--
-- Name: asset_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asset_assignments_id_seq OWNED BY public.asset_assignments.id;


--
-- Name: assets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assets (
    asset_tag character varying(15) NOT NULL,
    category character varying(30) NOT NULL,
    status character varying(20) DEFAULT 'Available'::character varying,
    assigned_to character varying(10),
    model character varying(100),
    serial_number character varying(100),
    brand character varying(50),
    vendor character varying(100),
    purchase_date date,
    ram character varying(20),
    storage character varying(30),
    processor character varying(60),
    installed_os character varying(40),
    CONSTRAINT assets_category_check CHECK (((category)::text = ANY ((ARRAY['Laptop'::character varying, 'Desktop'::character varying, 'Monitor'::character varying, 'Headset'::character varying, 'Keyboard'::character varying, 'Mouse'::character varying, 'Webcam'::character varying])::text[]))),
    CONSTRAINT assets_status_check CHECK (((status)::text = ANY ((ARRAY['Assigned'::character varying, 'Available'::character varying, 'Maintenance'::character varying, 'Retired'::character varying])::text[])))
);


ALTER TABLE public.assets OWNER TO postgres;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id integer NOT NULL,
    employee_id character varying(10),
    action character varying(50) NOT NULL,
    table_affected character varying(50) NOT NULL,
    record_id character varying(50),
    "timestamp" timestamp without time zone DEFAULT now()
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_logs_id_seq OWNER TO postgres;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: departments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departments (
    department_name character varying(50) NOT NULL
);


ALTER TABLE public.departments OWNER TO postgres;

--
-- Name: employees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employees (
    employee_id character varying(10) NOT NULL,
    full_name character varying(100) NOT NULL,
    department_name character varying(50),
    designation character varying(100),
    phone character varying(20),
    join_date date NOT NULL,
    exit_date date,
    status character varying(20) DEFAULT 'active'::character varying,
    date_of_birth date,
    address character varying(255),
    gender character varying(20),
    emergency_contact_name character varying(100),
    emergency_contact_phone character varying(20),
    blood_group character varying(5),
    profile_picture character varying(255),
    CONSTRAINT employees_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying])::text[])))
);


ALTER TABLE public.employees OWNER TO postgres;

--
-- Name: leave_balances; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.leave_balances (
    employee_id character varying(10) NOT NULL,
    casual_total integer DEFAULT 12,
    casual_used integer DEFAULT 0,
    sick_total integer DEFAULT 7,
    sick_used integer DEFAULT 0
);


ALTER TABLE public.leave_balances OWNER TO postgres;

--
-- Name: leaves; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.leaves (
    id integer NOT NULL,
    leave_no character varying(15) NOT NULL,
    employee_id character varying(10),
    leave_type character varying(20) NOT NULL,
    from_date date NOT NULL,
    to_date date NOT NULL,
    reason character varying(255),
    status character varying(20) DEFAULT 'Pending'::character varying,
    applied_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.leaves OWNER TO postgres;

--
-- Name: leaves_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.leaves_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.leaves_id_seq OWNER TO postgres;

--
-- Name: leaves_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.leaves_id_seq OWNED BY public.leaves.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    recipient_role character varying(20),
    recipient_id character varying(10),
    message character varying(255) NOT NULL,
    ticket_no character varying(15),
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: salaries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.salaries (
    id integer NOT NULL,
    employee_id character varying(10),
    net_salary numeric(10,2) NOT NULL,
    effective_date date NOT NULL,
    basic_salary numeric(10,2),
    hra numeric(10,2)
);


ALTER TABLE public.salaries OWNER TO postgres;

--
-- Name: salaries_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.salaries_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.salaries_id_seq OWNER TO postgres;

--
-- Name: salaries_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.salaries_id_seq OWNED BY public.salaries.id;


--
-- Name: tickets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tickets (
    ticket_no character varying(15) NOT NULL,
    raised_by character varying(10),
    category character varying(10) NOT NULL,
    subject character varying(200) NOT NULL,
    priority character varying(10) DEFAULT 'Medium'::character varying,
    status character varying(20) DEFAULT 'Open'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    ticket_type character varying(30),
    leave_type character varying(20),
    leave_from date,
    leave_to date,
    hr_reply text,
    asset_tag character varying(15),
    CONSTRAINT tickets_category_check CHECK (((category)::text = ANY ((ARRAY['HR'::character varying, 'IT'::character varying])::text[]))),
    CONSTRAINT tickets_priority_check CHECK (((priority)::text = ANY ((ARRAY['Low'::character varying, 'Medium'::character varying, 'High'::character varying])::text[]))),
    CONSTRAINT tickets_status_check CHECK (((status)::text = ANY ((ARRAY['Open'::character varying, 'In Progress'::character varying, 'Resolved'::character varying, 'Closed'::character varying, 'Approved'::character varying, 'Rejected'::character varying])::text[])))
);


ALTER TABLE public.tickets OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    employee_id character varying(10) NOT NULL,
    email character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role character varying(20) NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying,
    must_change_password boolean DEFAULT true,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['HR'::character varying, 'ITADMIN'::character varying, 'EMPLOYEE'::character varying])::text[]))),
    CONSTRAINT users_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: asset_assignments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_assignments ALTER COLUMN id SET DEFAULT nextval('public.asset_assignments_id_seq'::regclass);


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: leaves id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leaves ALTER COLUMN id SET DEFAULT nextval('public.leaves_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: salaries id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salaries ALTER COLUMN id SET DEFAULT nextval('public.salaries_id_seq'::regclass);


--
-- Data for Name: asset_assignments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asset_assignments (id, asset_tag, employee_id, assigned_date, returned_date) FROM stdin;
2	ASTH-001	EMP004	2026-08-07	2026-08-07
3	ASTH-001	EMP003	2026-08-07	\N
4	ASTK-001	EMP003	2026-08-07	\N
5	ASTM-001	EMP006	2026-08-07	2026-08-07
1	ASTL-001	EMP004	2026-08-07	2026-08-10
6	ASTL-001	EMP003	2026-08-10	\N
7	ASTM-001	EMP001	2026-08-10	2026-08-10
8	ASTL-002	EMP005	2026-08-12	\N
\.


--
-- Data for Name: assets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assets (asset_tag, category, status, assigned_to, model, serial_number, brand, vendor, purchase_date, ram, storage, processor, installed_os) FROM stdin;
ASTH-001	Headset	Assigned	EMP003	NOISE 4E	67853	\N	\N	\N	\N	\N	\N	\N
ASTK-001	Keyboard	Assigned	EMP003	Lenovo xcv	7890	\N	\N	\N	\N	\N	\N	\N
ASTL-001	Laptop	Assigned	EMP003	Dell Latitude 4320	98765	\N	\N	\N	\N	\N	\N	\N
ASTM-001	Monitor	Maintenance	\N	HP	1235	\N	\N	\N	\N	\N	\N	\N
ASTL-002	Laptop	Assigned	EMP005	Dell Latitude 4320	78907	Dell	Dell	2025-01-08	16GB	512 GB SSD	1th Gen Intel(R) Core(TM) i5-1135G7 @ 2.40GHz (1.38 GHz)	Windows 11 Pro
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, employee_id, action, table_affected, record_id, "timestamp") FROM stdin;
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.departments (department_name) FROM stdin;
Human Resources
Engineering
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.employees (employee_id, full_name, department_name, designation, phone, join_date, exit_date, status, date_of_birth, address, gender, emergency_contact_name, emergency_contact_phone, blood_group, profile_picture) FROM stdin;
EMP002	Sarah Mitchell	Human Resources	HR Manager	+1-555-0102	2020-06-01	\N	active	\N	\N	\N	\N	\N	\N	\N
EMP005	Test User	Human Resources	Analyst	+1-555-0199	2024-06-01	\N	active	\N	\N	\N	\N	\N	\N	\N
EMP006	Test User Two	Human Resources	Analyst	+1-555-0200	2024-06-01	\N	active	\N	\N	\N	\N	\N	\N	\N
EMP001	John Doe	Human Resources	Senior Software Engineer	+1-555-0101	2021-03-15	\N	active	2001-01-11	1-1109, Shillong	Male	uyoe	890890890	O+	\N
EMP007	Udhaya S	Engineering	Director-CEO	891036182	2026-08-01	2026-08-12	inactive	\N	\N	\N	\N	\N	\N	\N
EMP004	Sandeep	Engineering	JR Solutions Engineer	6305560838	2026-07-01	\N	active	2005-01-13	DNo: 1-1189-31, NGO COLONY	Male	Patnam Jaideep Das yadav	6301971423	b+	EMP004_1786598157587.jpeg
EMP008	xyz	Engineering	Senior Software Engineer	630556083	2026-08-13	\N	active	\N	\N	\N	\N	\N	\N	\N
EMP003	Mike Chen	Human Resources	IT Administrator	+1-555-0103	2022-01-10	\N	active	2000-01-01	PLOT NO. 149, BHARATHI NAGAR	Male	xyz	098989	b+	\N
\.


--
-- Data for Name: leave_balances; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.leave_balances (employee_id, casual_total, casual_used, sick_total, sick_used) FROM stdin;
EMP002	12	0	7	0
EMP003	12	0	7	0
EMP005	12	0	7	0
EMP006	12	0	7	0
EMP007	12	0	7	0
EMP001	12	3	7	0
EMP008	12	0	7	0
EMP004	12	10	7	4
\.


--
-- Data for Name: leaves; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.leaves (id, leave_no, employee_id, leave_type, from_date, to_date, reason, status, applied_at) FROM stdin;
1	LV-001	EMP001	Casual	2026-08-07	2026-08-08	Personal Work	Approved	2026-08-06 15:44:00.345237
2	LV-002	EMP001	Casual	2026-08-07	2026-08-08	Personal Work	Approved	2026-08-06 15:49:30.54202
3	LV-003	EMP001	Casual	2026-08-08	2026-08-10	personal work	Approved	2026-08-06 16:05:12.264301
4	LV-004	EMP004	Casual	2026-08-14	2026-08-15	grvccv 	Approved	2026-08-13 12:51:19.19407
5	LV-005	EMP004	Casual	2026-08-14	2026-08-15	dsuhdhid	Approved	2026-08-13 12:54:19.397649
6	LV-006	EMP004	Casual	2026-08-15	2026-08-16	husdhd	Approved	2026-08-13 12:56:58.911784
7	LV-007	EMP004	Casual	2026-08-22	2026-08-23	mdhnc	Approved	2026-08-13 12:58:57.276798
8	LV-008	EMP004	Casual	2026-08-13	2026-08-14	dhuduchdch	Approved	2026-08-13 13:00:44.048706
9	LV-009	EMP004	Sick	2026-08-14	2026-08-15	sjbjdusd	Approved	2026-08-13 13:02:20.278369
10	LV-010	EMP004	Sick	2026-08-13	2026-08-14	sudghuasdgxuisd	Approved	2026-08-13 13:06:09.412762
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, recipient_role, recipient_id, message, ticket_no, is_read, created_at) FROM stdin;
14	\N	EMP001	Your leave request LV-003 was approved	LV-003	t	2026-08-06 16:05:42.257878
12	\N	EMP001	Your leave request LV-002 was approved	LV-002	t	2026-08-06 15:49:54.250686
10	\N	EMP001	Your leave request LV-001 was approved	LV-001	t	2026-08-06 15:44:49.423448
8	\N	EMP001	Your ticket TKT-008 was updated to "Resolved"	TKT-008	t	2026-08-06 12:54:49.936829
6	\N	EMP001	Your ticket TKT-007 was updated to "Rejected"	TKT-007	t	2026-08-06 12:51:58.528627
4	\N	EMP001	Your ticket TKT-006 was updated to "Approved"	TKT-006	t	2026-08-06 12:50:36.724505
2	\N	EMP001	Your ticket TKT-005 was updated to "Approved"	TKT-005	t	2026-08-06 12:41:55.231363
23	\N	EMP001	Your ticket TKT-013 was updated to "Resolved"	TKT-013	t	2026-08-10 12:10:44.159489
\.


--
-- Data for Name: salaries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.salaries (id, employee_id, net_salary, effective_date, basic_salary, hra) FROM stdin;
1	EMP001	11030.00	2024-01-01	\N	\N
2	EMP004	90.00	2026-08-06	80.00	10.00
3	EMP003	8102.00	2026-08-05	8090.00	12.00
\.


--
-- Data for Name: tickets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tickets (ticket_no, raised_by, category, subject, priority, status, created_at, ticket_type, leave_type, leave_from, leave_to, hr_reply, asset_tag) FROM stdin;
TKT-001	EMP001	IT	Laptop screen flickering	High	Resolved	2026-08-05 11:53:52.53422	\N	\N	\N	\N	\N	\N
TKT-002	EMP001	IT	Laptop not working	Medium	Open	2026-08-06 11:48:29.154739	\N	\N	\N	\N	\N	\N
TKT-003	EMP001	HR	Leave	Medium	Open	2026-08-06 11:49:59.44137	\N	\N	\N	\N	\N	\N
TKT-004	EMP007	HR	Leave	Medium	Open	2026-08-06 11:51:09.108262	\N	\N	\N	\N	\N	\N
TKT-005	EMP001	HR	Casual Leave (2026-08-06 to 2026-08-07)	Medium	Approved	2026-08-06 12:39:22.303215	Leave	Casual	2026-08-06	2026-08-07	\N	\N
TKT-006	EMP001	HR	Sick Leave (2026-08-07 to 2026-08-08)	Low	Approved	2026-08-06 12:50:17.522773	Leave	Sick	2026-08-07	2026-08-08	\N	\N
TKT-007	EMP001	HR	Sick Leave (2026-08-08 to 2026-08-09)	Medium	Rejected	2026-08-06 12:51:39.745037	Leave	Sick	2026-08-08	2026-08-09	\N	\N
TKT-008	EMP001	IT	Password error	Medium	Resolved	2026-08-06 12:54:08.014732	Access	\N	\N	\N	password: Appglide@2021	\N
TKT-009	EMP004	IT	Laptop Not Turing On	High	Resolved	2026-08-07 17:51:40.41938	Hardware	\N	\N	\N	xyz	\N
TKT-010	EMP004	IT	Not turining on	Medium	Resolved	2026-08-10 10:29:50.705503	Hardware	\N	\N	\N	Asset ASTL-001 sent for maintenance.	ASTL-001
TKT-012	EMP004	HR	gvxstyu	Medium	Open	2026-08-10 12:02:49.541089	Management	\N	\N	\N	\N	\N
TKT-011	EMP004	IT	gvxstyu	Medium	Resolved	2026-08-10 11:09:23.557024	Hardware	\N	\N	\N	xch	\N
TKT-013	EMP001	IT	Laptop Not Turing On	Medium	Resolved	2026-08-10 12:10:08.440896	Hardware	\N	\N	\N	Asset ASTM-001 sent for maintenance.	ASTM-001
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (employee_id, email, password_hash, role, status, must_change_password) FROM stdin;
EMP005	test.user@company.com	$2b$10$ANKOYJLXzVSYf/96z4ac0eMQH6n98ny0kppU0vOAvMjsXy33SGNmy	EMPLOYEE	active	t
EMP006	test.user2@company.com	$2b$10$06HmmgI/aZTmsujRAeQcSOJfkVtUX9v6/tCl6N3XP.FM3.Suoo5hC	EMPLOYEE	active	f
EMP002	sarah.mitchell@company.com	$2b$10$G71Cb3deQLhuQafaZQWSNOR9EFy6p2LGabE9r7AEb025EFpPUZgzG	HR	active	f
EMP003	mike.chen@company.com	$2b$10$0zjQ2.KpicYaLstIJxuZEOVGDLsFpmpJ5VefP5emtmWZufVOy1Ko2	ITADMIN	active	f
EMP004	sandeep.p@company.com	$2b$10$QvRl5b4ivlbWfDzHIt9qg.7O20uRZBD260KxqrPBka1a/3O4e1BEa	EMPLOYEE	active	f
EMP001	john.doe@company.com	$2b$10$BaOaC5zPWE1.A7hn2B/nRuF0iXk6PR6PqghQLDddBVp5DG2qBin0i	EMPLOYEE	active	f
EMP007	udhayas@company.com	$2b$10$fxx.ZyjlEchj5yOMbl1neO1r8B113ycR4HKLXAPWjUbn./hqDvYKa	EMPLOYEE	inactive	f
EMP008	xyz@company.com	$2b$10$Ri.Ga7wTvH.124mZ8Yjc6ePvR6QAw68N3NrN.FyQtLNzGfr1K0Djm	EMPLOYEE	active	f
\.


--
-- Name: asset_assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asset_assignments_id_seq', 8, true);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 1, false);


--
-- Name: leaves_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.leaves_id_seq', 10, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 37, true);


--
-- Name: salaries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.salaries_id_seq', 3, true);


--
-- Name: asset_assignments asset_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_assignments
    ADD CONSTRAINT asset_assignments_pkey PRIMARY KEY (id);


--
-- Name: assets assets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_pkey PRIMARY KEY (asset_tag);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (department_name);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (employee_id);


--
-- Name: leave_balances leave_balances_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_balances
    ADD CONSTRAINT leave_balances_pkey PRIMARY KEY (employee_id);


--
-- Name: leaves leaves_leave_no_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leaves
    ADD CONSTRAINT leaves_leave_no_key UNIQUE (leave_no);


--
-- Name: leaves leaves_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leaves
    ADD CONSTRAINT leaves_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: salaries salaries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salaries
    ADD CONSTRAINT salaries_pkey PRIMARY KEY (id);


--
-- Name: tickets tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_pkey PRIMARY KEY (ticket_no);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (employee_id);


--
-- Name: idx_asset_assignments_asset; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_asset_assignments_asset ON public.asset_assignments USING btree (asset_tag);


--
-- Name: idx_asset_assignments_employee; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_asset_assignments_employee ON public.asset_assignments USING btree (employee_id);


--
-- Name: idx_assets_assigned_to; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_assets_assigned_to ON public.assets USING btree (assigned_to);


--
-- Name: idx_audit_logs_employee; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_logs_employee ON public.audit_logs USING btree (employee_id);


--
-- Name: idx_employees_department; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_employees_department ON public.employees USING btree (department_name);


--
-- Name: idx_salaries_employee; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_salaries_employee ON public.salaries USING btree (employee_id);


--
-- Name: idx_tickets_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tickets_category ON public.tickets USING btree (category);


--
-- Name: idx_tickets_raised_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_tickets_raised_by ON public.tickets USING btree (raised_by);


--
-- Name: asset_assignments asset_assignments_asset_tag_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_assignments
    ADD CONSTRAINT asset_assignments_asset_tag_fkey FOREIGN KEY (asset_tag) REFERENCES public.assets(asset_tag) ON DELETE CASCADE;


--
-- Name: asset_assignments asset_assignments_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asset_assignments
    ADD CONSTRAINT asset_assignments_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(employee_id) ON DELETE CASCADE;


--
-- Name: assets assets_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.employees(employee_id);


--
-- Name: audit_logs audit_logs_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.users(employee_id);


--
-- Name: employees employees_department_name_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_department_name_fkey FOREIGN KEY (department_name) REFERENCES public.departments(department_name);


--
-- Name: employees employees_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.users(employee_id) ON DELETE CASCADE;


--
-- Name: leave_balances leave_balances_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_balances
    ADD CONSTRAINT leave_balances_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(employee_id);


--
-- Name: leaves leaves_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leaves
    ADD CONSTRAINT leaves_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(employee_id);


--
-- Name: salaries salaries_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salaries
    ADD CONSTRAINT salaries_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(employee_id) ON DELETE CASCADE;


--
-- Name: tickets tickets_asset_tag_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_asset_tag_fkey FOREIGN KEY (asset_tag) REFERENCES public.assets(asset_tag);


--
-- Name: tickets tickets_raised_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_raised_by_fkey FOREIGN KEY (raised_by) REFERENCES public.employees(employee_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict qWqnhP23hIBCuZpdISMaMpFvLW1wRgS3ilcak4X8alwYpwUEHJDlILbdus16PPc

