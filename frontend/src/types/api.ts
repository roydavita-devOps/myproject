export type RoleName = 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'EDITOR';
export type RoleScope = 'PLATFORM' | 'TENANT';
export type WebsiteStatus = 'DRAFT' | 'PUBLISHED' | 'UNPUBLISHED' | 'ARCHIVED';

export type AuthUser = {
  id: string;
  tenantId: string | null;
  email: string;
  emailVerified: boolean;
  role: RoleName;
  scope: RoleScope;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

export type AuthSession = {
  id: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  expiresAt: string;
  revokedAt?: string | null;
  createdAt: string;
  active: boolean;
};

export type Tenant = {
  id: string;
  name: string;
  slug: string;
  status: string;
  createdAt: string;
  subscriptions?: Subscription[];
  domains?: Domain[];
};

export type Subscription = {
  id: string;
  plan: string;
  status: string;
  monthlyPrice: string;
};

export type Domain = {
  id: string;
  domain: string;
  type: string;
  status: string;
};

export type Template = {
  id: string;
  name: string;
  businessType: string;
  schema: { sections?: string[] };
};

export type Theme = {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string | null;
  typography?: { heading?: string; body?: string };
  logoUrl?: string | null;
  heroImageUrl?: string | null;
};

export type Website = {
  id: string;
  tenantId: string;
  tenant?: Pick<Tenant, 'slug'>;
  templateId: string;
  themeId?: string | null;
  status: WebsiteStatus;
  businessName: string;
  tagline?: string | null;
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  socialMedia?: Record<string, string> | null;
  mapsUrl?: string | null;
  openingHours?: Record<string, unknown> | null;
  template?: Template;
  theme?: Theme | null;
  categories?: MenuCategory[];
  menus?: MenuItem[];
  galleries?: GalleryItem[];
  reviews?: ReviewItem[];
};

export type MenuCategory = {
  id: string;
  websiteId: string;
  name: string;
  sortOrder: number;
};

export type MenuItem = {
  id: string;
  websiteId: string;
  categoryId?: string | null;
  name: string;
  description?: string | null;
  price?: string | number | null;
  imageUrl?: string | null;
  sortOrder: number;
};

export type GalleryItem = {
  id: string;
  category?: string | null;
  imageUrl: string;
  altText?: string | null;
};

export type ReviewItem = {
  id: string;
  customerName: string;
  rating: number;
  comment?: string | null;
};
