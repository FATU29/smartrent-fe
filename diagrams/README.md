# SmartRent FE — Sơ đồ tổ chức mã nguồn

Tài liệu sơ đồ kiến trúc & tổ chức source code của webapp `smartrent-fe`.

> Stack chính: **Next.js 15 (Pages Router)** · **React 19** · **TypeScript** · **TanStack Query** (server state) · **Zustand** (client state) · **React Context** (auth/theme/i18n) · **Axios** (service layer) · **next-intl** (vi/en) · **Tailwind + Radix UI** · Atomic Design.

Các sơ đồ được viết bằng [Mermaid](https://mermaid.js.org/) — GitHub/VS Code (với extension Mermaid) render trực tiếp.

## Mục lục

1. [Kiến trúc phân lớp](#1-kiến-trúc-phân-lớp-layered-architecture)
2. [Cây thư mục `src/`](#2-cây-thư-mục-src)
3. [Atomic Design — phân tầng component](#3-atomic-design--phân-tầng-component)
4. [Luồng dữ liệu (Data Flow)](#4-luồng-dữ-liệu-data-flow)
5. [Cây Provider trong `_app.tsx`](#5-cây-provider-trong-_apptsx)
6. [Bản đồ Routing (Pages Router)](#6-bản-đồ-routing-pages-router)
7. [Quản lý State](#7-quản-lý-state)

---

## 1. Kiến trúc phân lớp (Layered Architecture)

Ứng dụng được tổ chức thành các lớp rõ ràng, dữ liệu chảy một chiều từ UI → hooks → service → API backend.

```mermaid
flowchart TB
    subgraph Routing["🧭 Routing Layer — src/pages"]
        Pages["Pages (Pages Router)\n_app · _document · index · seller/* · listing-detail/*"]
    end

    subgraph UI["🎨 UI Layer — src/components (Atomic Design)"]
        Templates["templates/ (28) — bố cục từng trang"]
        Organisms["organisms/ (29) — khối phức hợp"]
        Molecules["molecules/ (106)"]
        Atoms["atoms/ (71) — Radix + Tailwind"]
        Layouts["layouts/ · utility/"]
    end

    subgraph Logic["🧠 Logic Layer"]
        Hooks["hooks/ (36) — useListings, useAuth, useAI…"]
        Contexts["contexts/ (10) — auth, theme, i18n…"]
        Store["store/ — Zustand (auth, compare)"]
    end

    subgraph Data["🔌 Data Access Layer — src/api"]
        Services["services/ (32) — *.service.ts"]
        Types["types/ (33) — *.type.ts"]
        Paths["paths — endpoint constants"]
    end

    subgraph Infra["⚙️ Infrastructure — src/configs · utils · lib"]
        Axios["configs/axios — client/server, interceptors, refresh-token"]
        Utils["utils/ (20) — auth, currency, date, mapper…"]
        Constants["constants/ — route, regex, env"]
        I18n["messages/ — vi.json · en.json"]
    end

    Backend["☁️ Backend REST API"]

    Pages --> Templates
    Templates --> Organisms --> Molecules --> Atoms
    Organisms -.dùng.-> Hooks
    Templates -.dùng.-> Hooks
    Hooks --> Services
    Hooks <--> Store
    Pages -.bọc bởi.-> Contexts
    Services --> Types
    Services --> Paths
    Services --> Axios
    Axios --> Backend
    Hooks -.helpers.-> Utils
    UI -.text.-> I18n
```

---

## 2. Cây thư mục `src/`

```mermaid
flowchart LR
    src["src/"]
    src --> pages["pages/ — routes (Pages Router)"]
    src --> components["components/ — Atomic Design"]
    src --> api["api/ — services + types + paths"]
    src --> hooks["hooks/ — 36 custom hooks (TanStack Query)"]
    src --> contexts["contexts/ — 10 React Context providers"]
    src --> store["store/ — Zustand stores"]
    src --> configs["configs/axios — HTTP client + interceptors"]
    src --> utils["utils/ — pure helpers"]
    src --> constants["constants/ — route, regex, env, common"]
    src --> messages["messages/ — i18n (vi, en)"]
    src --> lib["lib/ — cn() & shadcn helpers"]
    src --> theme["theme/ · styles/ — fonts + global CSS"]
    src --> typesg["types/ — global TS types"]
    src --> mock["mock/ · test/ — fixtures & test setup"]

    components --> c1["atoms/ (71)"]
    components --> c2["molecules/ (106)"]
    components --> c3["organisms/ (29)"]
    components --> c4["templates/ (28)"]
    components --> c5["layouts/ · utility/"]
```

> Alias import: `@/*` → `./src/*` (xem `tsconfig.json`).

---

## 3. Atomic Design — phân tầng component

`src/components/` tuân theo Atomic Design: thành phần nhỏ ghép thành thành phần lớn hơn, template lắp vào page.

```mermaid
flowchart TD
    Page["📄 Page (src/pages/*)"] --> Template
    Template["🧩 Template\n(homepage, dashboardTemplate, detailPostTemplate…)\nbố cục toàn trang"] --> Organism
    Organism["🏗️ Organism\n(appHeader, listings, aiChatWidget, footer…)\nkhối UI có logic"] --> Molecule
    Molecule["🔬 Molecule\n(notificationPanel, search bar, card group…)\nnhóm atom"] --> Atom
    Atom["⚛️ Atom\n(button, input, badge, dialog, avatar…)\nRadix UI + Tailwind, không state nghiệp vụ"]

    Layout["📐 layouts/ (homePageLayout, sellerLayout)"] -.bọc page qua getLayout.-> Page
    Utility["🔧 utility/ (AuthRouteGate, DevtoolsGate)"] -.cross-cutting.-> Page

    classDef big fill:#dbeafe,stroke:#2563eb;
    classDef small fill:#dcfce7,stroke:#16a34a;
    class Template,Organism big;
    class Molecule,Atom small;
```

| Tầng         | Số lượng | Vai trò                                                         |
| ------------ | -------: | --------------------------------------------------------------- |
| `atoms/`     |       71 | UI nguyên thủy (button, input, dialog…) — chủ yếu wrap Radix UI |
| `molecules/` |      106 | Ghép nhiều atom thành đơn vị UI tái dùng                        |
| `organisms/` |       29 | Khối lớn có logic (header, listing list, AI chat)               |
| `templates/` |       28 | Bố cục từng loại trang, lắp organisms lại                       |
| `layouts/`   |        2 | Khung chung (home, seller) gắn qua `getLayout`                  |
| `utility/`   |        2 | Cross-cutting (gate auth, devtools)                             |

---

## 4. Luồng dữ liệu (Data Flow)

Ví dụ: thao tác đọc/ghi listing đi qua đủ các lớp.

```mermaid
sequenceDiagram
    participant C as Component (organism/template)
    participant H as Hook (useListings)
    participant Q as TanStack Query
    participant S as Service (listing.service.ts)
    participant AX as Axios instance + interceptors
    participant API as Backend REST API

    C->>H: gọi useCreateDraft() / useQuery
    H->>Q: useMutation / useQuery({ queryKey })
    Q->>S: mutationFn → ListingService.createDraft(data)
    S->>AX: apiRequest(PATHS.xxx, payload)
    AX->>AX: request interceptor — gắn accessToken
    AX->>API: HTTP request
    API-->>AX: response / 401
    alt 401 hết hạn token
        AX->>API: refreshToken() (dedup 1 lần)
        API-->>AX: token mới → retry request
    end
    AX-->>S: ApiResponse<T>
    S-->>Q: data (typed)
    Q-->>H: { data, isLoading, error }
    H->>Q: onSuccess → invalidateQueries(['my-drafts'])
    H-->>C: re-render với dữ liệu mới
```

**Nguyên tắc:**

- Component **không** gọi axios trực tiếp — luôn qua **hook**.
- Hook dùng **TanStack Query** để cache + đồng bộ server state; ghi xong `invalidateQueries`.
- **Service** là nơi duy nhất biết endpoint (`PATHS`) và kiểu dữ liệu (`*.type.ts`).
- **Interceptor** xử lý auth token + tự refresh khi 401 (có dedup tránh refresh đồng thời).

---

## 5. Cây Provider trong `_app.tsx`

Thứ tự bọc provider quyết định context khả dụng cho toàn app.

```mermaid
flowchart TD
    EB["ErrorBoundary"] --> SL["SwitchLanguageProvider (vi/en)"]
    SL --> PQ["PersistQueryClientProvider / QueryClientProvider\n(TanStack Query + persist localStorage)"]
    PQ --> NI["NextIntlClientProvider (messages)"]
    NI --> NT["NextThemesProvider (dark/light)"]
    NT --> TD["ThemeDataProvider"]
    TD --> AU["AuthProvider"]
    AU --> AD["AuthDialogProvider"]
    AD --> ARG["AuthRouteGate (bảo vệ route)"]
    AD --> PAGE["getLayout(&lt;Component /&gt;) — page nội dung"]
    AD --> T["Toaster (sonner)"]
    PAGE -.lazy.-> AIW["aiChatWidget (dynamic import)"]
    PAGE -.dev only.-> DG["DevtoolsGate (React Query Devtools)"]
```

---

## 6. Bản đồ Routing (Pages Router)

`src/pages/` → URL theo cơ chế file-based của Next.js Pages Router.

```mermaid
flowchart LR
    root["/"] --> home["index.tsx → trang chủ"]
    root --> auth["auth/ → callback · magic-link"]
    root --> compare["compare/ → so sánh BĐS"]
    root --> following["following/ → người theo dõi"]
    root --> detail["listing-detail/[...slug] → chi tiết tin"]
    root --> maps["maps/ → bản đồ"]
    root --> news["news/ · news/[slug] → tin tức"]
    root --> payment["payment/result · payment/status"]
    root --> props["properties/ · properties/seller"]
    root --> saved["saved-listings/"]
    root --> err["404.tsx"]

    root --> seller["seller/ (khu vực người bán)"]
    seller --> s1["dashboard · account · listings"]
    seller --> s2["create-post · update-post · drafts"]
    seller --> s3["customers · transactions"]

    root --> snet["sellernet/"]
    snet --> n1["guides · membership · personal"]
```

> Đặc biệt: `_app.tsx` (root component + providers), `_document.tsx` (HTML shell). Dynamic routes: `[...slug]` (catch-all chi tiết tin), `[slug]` (news).

---

## 7. Quản lý State

Ba cơ chế state song song, mỗi loại cho một mục đích.

```mermaid
flowchart TB
    subgraph Server["Server State — TanStack Query"]
        RQ["useQuery / useMutation\nqua 36 hooks\ncache + persist localStorage + auto refetch"]
    end
    subgraph Client["Client State — Zustand"]
        Z1["store/auth — phiên đăng nhập"]
        Z2["store/compare — danh sách so sánh"]
    end
    subgraph App["App/UI State — React Context"]
        CX["auth · authDialog · theme · switchLanguage\ncreatePost · updatePost · list · location · news"]
    end

    Comp["Components"] --> RQ
    Comp --> Z1
    Comp --> Z2
    Comp --> CX
    RQ --> Services["api/services → Backend"]
```

| Loại state       | Công cụ        | Dùng cho                                                        |
| ---------------- | -------------- | --------------------------------------------------------------- |
| **Server state** | TanStack Query | Dữ liệu từ API: listings, news, user… (cache, refetch, persist) |
| **Client state** | Zustand        | Trạng thái global nhẹ: auth session, danh sách so sánh          |
| **App/UI state** | React Context  | Theme, ngôn ngữ, dialog auth, flow tạo/sửa tin                  |

---

_Sơ đồ sinh tự động bằng cách đọc cấu trúc `src/`. Khi refactor thư mục lớn, cập nhật lại file này._
