import {
  BusinessType,
  ContentStatus,
  DomainStatus,
  DomainType,
  Prisma,
  PrismaClient,
  ReviewSource,
  ReviewStatus,
  RoleName,
  RoleScope,
  SubscriptionPlan,
  SubscriptionStatus,
  TemplateStatus,
  TenantStatus,
  UserStatus,
  WebsiteStatus,
} from '@prisma/client';
import { hash } from 'bcryptjs';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

loadSeedEnv();

const prisma = new PrismaClient();

const DEMO_PASSWORD = 'Password12345';

type DemoTenant = {
  name: string;
  slug: string;
  ownerName: string;
  ownerEmail: string;
  businessType: BusinessType;
  tagline: string;
  description: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  heroImageUrl: string;
  logoUrl: string;
  categories: Array<{
    name: string;
    items: Array<{ name: string; description: string; price: string; imageUrl: string }>;
  }>;
  gallery: Array<{ category: string; imageUrl: string; altText: string }>;
  reviews: Array<{ customerName: string; rating: number; comment: string }>;
};

const demoTenants: DemoTenant[] = [
  {
    name: 'WARTEG MONCER',
    slug: 'warteg-moncer',
    ownerName: 'Admin Warteg Moncer',
    ownerEmail: 'admin@warteg-moncer.demo',
    businessType: BusinessType.WARTEG,
    tagline: 'Masakan rumahan hangat setiap hari',
    description: 'Warteg modern dengan lauk segar, harga jelas, dan layanan cepat untuk pelanggan sekitar.',
    address: 'Jl. Melati No. 12, Jakarta Selatan',
    phone: '+622175001001',
    whatsapp: '+6281210010010',
    email: 'halo@warteg-moncer.demo',
    primaryColor: '#0f766e',
    secondaryColor: '#f59e0b',
    accentColor: '#dc2626',
    heroImageUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d',
    logoUrl: 'https://placehold.co/256x256/0f766e/ffffff?text=WM',
    categories: [
      {
        name: 'Paket Nasi',
        items: [
          {
            name: 'Nasi Ayam Bakar',
            description: 'Ayam bakar bumbu kecap, nasi, sambal, dan lalapan.',
            price: '28000',
            imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e',
          },
          {
            name: 'Nasi Telur Balado',
            description: 'Telur balado pedas manis dengan sayur harian.',
            price: '18000',
            imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19',
          },
        ],
      },
      {
        name: 'Lauk Favorit',
        items: [
          {
            name: 'Tempe Orek',
            description: 'Tempe orek kering dengan cabai dan kecap.',
            price: '8000',
            imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
          },
        ],
      },
    ],
    gallery: [
      {
        category: 'Interior',
        imageUrl: 'https://images.unsplash.com/photo-1552566626-52f8b828add9',
        altText: 'Area makan Warteg Moncer',
      },
      {
        category: 'Menu',
        imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
        altText: 'Pilihan lauk Warteg Moncer',
      },
    ],
    reviews: [
      { customerName: 'Budi Santoso', rating: 5, comment: 'Lauknya lengkap dan rasanya konsisten.' },
      { customerName: 'Dewi Lestari', rating: 5, comment: 'Tempat bersih, cocok untuk makan siang cepat.' },
    ],
  },
  {
    name: 'Laundry Suka Suka',
    slug: 'laundry-suka-suka',
    ownerName: 'Admin Laundry Suka Suka',
    ownerEmail: 'admin@laundry-suka-suka.demo',
    businessType: BusinessType.LAUNDRY,
    tagline: 'Cucian rapi, wangi, dan tepat waktu',
    description: 'Layanan laundry kiloan, satuan, dan antar jemput untuk area perumahan dan kantor.',
    address: 'Jl. Anggrek No. 8, Bandung',
    phone: '+622220001002',
    whatsapp: '+6281220010020',
    email: 'halo@laundry-suka-suka.demo',
    primaryColor: '#2563eb',
    secondaryColor: '#14b8a6',
    accentColor: '#f97316',
    heroImageUrl: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60',
    logoUrl: 'https://placehold.co/256x256/2563eb/ffffff?text=LS',
    categories: [
      {
        name: 'Kiloan',
        items: [
          {
            name: 'Cuci Kering',
            description: 'Cuci dan kering untuk pakaian harian.',
            price: '7000',
            imageUrl: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f',
          },
          {
            name: 'Cuci Setrika',
            description: 'Paket lengkap cuci, kering, dan setrika.',
            price: '10000',
            imageUrl: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60',
          },
        ],
      },
      {
        name: 'Satuan',
        items: [
          {
            name: 'Bed Cover',
            description: 'Pencucian bed cover besar dengan pewangi premium.',
            price: '35000',
            imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85',
          },
        ],
      },
    ],
    gallery: [
      {
        category: 'Outlet',
        imageUrl: 'https://images.unsplash.com/photo-1604335399105-a0c585fd81a1',
        altText: 'Outlet Laundry Suka Suka',
      },
      {
        category: 'Proses',
        imageUrl: 'https://images.unsplash.com/photo-1551761429-8232f9f5955c',
        altText: 'Proses laundry profesional',
      },
    ],
    reviews: [
      { customerName: 'Rina Putri', rating: 5, comment: 'Antar jemputnya cepat dan pakaian wangi.' },
      { customerName: 'Andi Wijaya', rating: 4, comment: 'Harga jelas dan hasil setrika rapi.' },
    ],
  },
  {
    name: 'Klinik Sehat Bersama',
    slug: 'klinik-sehat-bersama',
    ownerName: 'Admin Klinik Sehat Bersama',
    ownerEmail: 'admin@klinik-sehat-bersama.demo',
    businessType: BusinessType.CLINIC,
    tagline: 'Layanan kesehatan keluarga yang dekat',
    description: 'Klinik umum dengan dokter berpengalaman, jadwal jelas, dan layanan konsultasi keluarga.',
    address: 'Jl. Kenanga No. 21, Surabaya',
    phone: '+623150001003',
    whatsapp: '+6281230010030',
    email: 'halo@klinik-sehat-bersama.demo',
    primaryColor: '#0891b2',
    secondaryColor: '#22c55e',
    accentColor: '#f43f5e',
    heroImageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d',
    logoUrl: 'https://placehold.co/256x256/0891b2/ffffff?text=KS',
    categories: [
      {
        name: 'Layanan',
        items: [
          {
            name: 'Konsultasi Dokter Umum',
            description: 'Pemeriksaan dan konsultasi keluhan kesehatan umum.',
            price: '75000',
            imageUrl: 'https://images.unsplash.com/photo-1581775231121-3bdbd2e3d29f',
          },
          {
            name: 'Cek Gula Darah',
            description: 'Pemeriksaan gula darah cepat dengan hasil langsung.',
            price: '30000',
            imageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5',
          },
        ],
      },
      {
        name: 'Paket Kesehatan',
        items: [
          {
            name: 'Medical Check Basic',
            description: 'Pemeriksaan tekanan darah, gula darah, dan konsultasi.',
            price: '150000',
            imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef',
          },
        ],
      },
    ],
    gallery: [
      {
        category: 'Fasilitas',
        imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d',
        altText: 'Ruang perawatan Klinik Sehat Bersama',
      },
      {
        category: 'Tim',
        imageUrl: 'https://images.unsplash.com/photo-1550831107-1553da8c8464',
        altText: 'Tim medis klinik',
      },
    ],
    reviews: [
      { customerName: 'Siti Aminah', rating: 5, comment: 'Dokternya komunikatif dan antrian tertib.' },
      { customerName: 'Hendra', rating: 5, comment: 'Klinik bersih dan staf ramah.' },
    ],
  },
  {
    name: 'Bengkel Maju Jaya',
    slug: 'bengkel-maju-jaya',
    ownerName: 'Admin Bengkel Maju Jaya',
    ownerEmail: 'admin@bengkel-maju-jaya.demo',
    businessType: BusinessType.WORKSHOP,
    tagline: 'Servis cepat untuk kendaraan harian',
    description: 'Bengkel motor dan mobil ringan dengan mekanik berpengalaman dan estimasi biaya transparan.',
    address: 'Jl. Pemuda No. 45, Yogyakarta',
    phone: '+622740001004',
    whatsapp: '+6281240010040',
    email: 'halo@bengkel-maju-jaya.demo',
    primaryColor: '#1f2937',
    secondaryColor: '#eab308',
    accentColor: '#ef4444',
    heroImageUrl: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc',
    logoUrl: 'https://placehold.co/256x256/1f2937/ffffff?text=BM',
    categories: [
      {
        name: 'Servis',
        items: [
          {
            name: 'Servis Ringan Motor',
            description: 'Pengecekan oli, rem, rantai, dan kelistrikan dasar.',
            price: '85000',
            imageUrl: 'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f',
          },
          {
            name: 'Ganti Oli Mobil',
            description: 'Jasa ganti oli mesin dengan pengecekan filter.',
            price: '120000',
            imageUrl: 'https://images.unsplash.com/photo-1625047509248-ec889cbff17f',
          },
        ],
      },
      {
        name: 'Paket',
        items: [
          {
            name: 'Tune Up Basic',
            description: 'Pemeriksaan performa mesin dan sistem pembakaran.',
            price: '250000',
            imageUrl: 'https://images.unsplash.com/photo-1538943985311-60a0e9a9b759',
          },
        ],
      },
    ],
    gallery: [
      {
        category: 'Workshop',
        imageUrl: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc',
        altText: 'Area kerja Bengkel Maju Jaya',
      },
      {
        category: 'Service',
        imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70',
        altText: 'Layanan kendaraan',
      },
    ],
    reviews: [
      { customerName: 'Agus Pratama', rating: 5, comment: 'Mekaniknya jelas menjelaskan kerusakan.' },
      { customerName: 'Nadia', rating: 4, comment: 'Servis cepat dan biaya sesuai estimasi.' },
    ],
  },
  {
    name: 'Cafe Nusantara',
    slug: 'cafe-nusantara',
    ownerName: 'Admin Cafe Nusantara',
    ownerEmail: 'admin@cafe-nusantara.demo',
    businessType: BusinessType.CAFE,
    tagline: 'Kopi lokal, ruang nyaman, rasa akrab',
    description: 'Cafe komunitas dengan kopi nusantara, makanan ringan, dan ruang kerja santai.',
    address: 'Jl. Diponegoro No. 17, Denpasar',
    phone: '+623610001005',
    whatsapp: '+6281250010050',
    email: 'halo@cafe-nusantara.demo',
    primaryColor: '#7c2d12',
    secondaryColor: '#16a34a',
    accentColor: '#f59e0b',
    heroImageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb',
    logoUrl: 'https://placehold.co/256x256/7c2d12/ffffff?text=CN',
    categories: [
      {
        name: 'Kopi',
        items: [
          {
            name: 'Kopi Susu Aren',
            description: 'Espresso, susu segar, dan gula aren.',
            price: '28000',
            imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd',
          },
          {
            name: 'Manual Brew Nusantara',
            description: 'Pilihan beans lokal dengan metode V60.',
            price: '35000',
            imageUrl: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31',
          },
        ],
      },
      {
        name: 'Snack',
        items: [
          {
            name: 'Pisang Goreng Madu',
            description: 'Pisang goreng hangat dengan madu dan kayu manis.',
            price: '24000',
            imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777',
          },
        ],
      },
    ],
    gallery: [
      {
        category: 'Interior',
        imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb',
        altText: 'Interior Cafe Nusantara',
      },
      {
        category: 'Coffee',
        imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085',
        altText: 'Kopi Cafe Nusantara',
      },
    ],
    reviews: [
      { customerName: 'Made Arta', rating: 5, comment: 'Kopinya enak dan tempatnya nyaman untuk kerja.' },
      { customerName: 'Clara', rating: 5, comment: 'Menu lokalnya terasa dan stafnya ramah.' },
    ],
  },
];

function loadSeedEnv() {
  for (const filePath of [resolve(process.cwd(), '.env'), resolve(process.cwd(), '..', '.env')]) {
    if (!existsSync(filePath)) continue;

    for (const line of readFileSync(filePath, 'utf8').split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const separatorIndex = trimmed.indexOf('=');
      if (separatorIndex === -1) continue;

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  }

  if (!process.env.DATABASE_URL) {
    const user = process.env.POSTGRES_USER || 'postgres';
    const password = process.env.POSTGRES_PASSWORD || 'postgres';
    const database = process.env.POSTGRES_DB || 'umkm_builder';
    const host = process.env.DATABASE_HOST || 'localhost';
    const port = process.env.DATABASE_PORT || process.env.POSTGRES_PORT || '15432';
    process.env.DATABASE_URL = `postgresql://${user}:${password}@${host}:${port}/${database}?schema=public`;
  }
}

async function main() {
  const passwordHash = await hash(DEMO_PASSWORD, 12);
  const rootDomain = process.env.ROOT_DOMAIN || 'localhost';

  const tenantAdminRole = await prisma.role.upsert({
    where: { name: RoleName.TENANT_ADMIN },
    update: { scope: RoleScope.TENANT },
    create: {
      name: RoleName.TENANT_ADMIN,
      scope: RoleScope.TENANT,
      description: 'Tenant owner with access to manage website content.',
    },
  });

  await prisma.role.upsert({
    where: { name: RoleName.SUPER_ADMIN },
    update: { scope: RoleScope.PLATFORM },
    create: {
      name: RoleName.SUPER_ADMIN,
      scope: RoleScope.PLATFORM,
      description: 'Platform administrator role.',
    },
  });

  await prisma.role.upsert({
    where: { name: RoleName.EDITOR },
    update: { scope: RoleScope.TENANT },
    create: {
      name: RoleName.EDITOR,
      scope: RoleScope.TENANT,
      description: 'Tenant content editor role.',
    },
  });

  for (const demo of demoTenants) {
    const template = await upsertTemplate(demo.businessType);
    const tenant = await prisma.tenant.upsert({
      where: { slug: demo.slug },
      update: {
        name: demo.name,
        status: TenantStatus.ACTIVE,
        deletedAt: null,
      },
      create: {
        name: demo.name,
        slug: demo.slug,
        status: TenantStatus.ACTIVE,
      },
    });

    await prisma.user.upsert({
      where: { tenantId_email: { tenantId: tenant.id, email: demo.ownerEmail } },
      update: {
        name: demo.ownerName,
        passwordHash,
        roleId: tenantAdminRole.id,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date(),
      },
      create: {
        tenantId: tenant.id,
        roleId: tenantAdminRole.id,
        name: demo.ownerName,
        email: demo.ownerEmail,
        passwordHash,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date(),
      },
    });

    await upsertSubscription(tenant.id);
    await upsertDomain(tenant.id, `${demo.slug}.${rootDomain}`, DomainType.SUBDOMAIN);

    const theme = await upsertTheme(tenant.id, demo);
    const website = await upsertWebsite(tenant.id, template.id, theme.id, demo);

    await seedMenus(tenant.id, website.id, demo);
    await seedGallery(tenant.id, website.id, demo);
    await seedReviews(tenant.id, website.id, demo);

    console.log(`Seeded ${demo.name}: ${demo.ownerEmail} / ${DEMO_PASSWORD}`);
  }
}

async function upsertTemplate(businessType: BusinessType) {
  const name = `${businessType.toLowerCase()}-demo-template`;
  return prisma.template.upsert({
    where: { name_businessType: { name, businessType } },
    update: {
      status: TemplateStatus.ACTIVE,
      schema: templateSchemaFor(businessType),
    },
    create: {
      name,
      businessType,
      status: TemplateStatus.ACTIVE,
      schema: templateSchemaFor(businessType),
    },
  });
}

async function upsertSubscription(tenantId: string) {
  const existing = await prisma.subscription.findFirst({ where: { tenantId } });
  const data = {
    plan: SubscriptionPlan.BUSINESS,
    status: SubscriptionStatus.ACTIVE,
    monthlyPrice: new Prisma.Decimal(149000),
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  };

  if (existing) return prisma.subscription.update({ where: { id: existing.id }, data });
  return prisma.subscription.create({ data: { tenantId, ...data } });
}

async function upsertDomain(tenantId: string, domain: string, type: DomainType) {
  return prisma.domain.upsert({
    where: { domain },
    update: {
      tenantId,
      type,
      status: DomainStatus.VERIFIED,
      verifiedAt: new Date(),
    },
    create: {
      tenantId,
      domain,
      type,
      status: DomainStatus.VERIFIED,
      verifiedAt: new Date(),
    },
  });
}

async function upsertTheme(tenantId: string, demo: DemoTenant) {
  const existing = await prisma.theme.findFirst({ where: { tenantId, name: 'Demo Theme' } });
  const data = {
    name: 'Demo Theme',
    primaryColor: demo.primaryColor,
    secondaryColor: demo.secondaryColor,
    accentColor: demo.accentColor,
    logoUrl: demo.logoUrl,
    heroImageUrl: demo.heroImageUrl,
    typography: { heading: 'Inter', body: 'Inter' },
  };

  if (existing) return prisma.theme.update({ where: { id: existing.id }, data });
  return prisma.theme.create({ data: { tenantId, ...data } });
}

async function upsertWebsite(tenantId: string, templateId: string, themeId: string, demo: DemoTenant) {
  const existing = await prisma.website.findFirst({ where: { tenantId, businessName: demo.name } });
  const data = {
    templateId,
    themeId,
    status: WebsiteStatus.PUBLISHED,
    businessName: demo.name,
    tagline: demo.tagline,
    description: demo.description,
    address: demo.address,
    phone: demo.phone,
    whatsapp: demo.whatsapp,
    email: demo.email,
    socialMedia: {
      instagram: `https://instagram.com/${demo.slug}`,
      facebook: `https://facebook.com/${demo.slug}`,
    },
    mapsUrl: 'https://maps.google.com',
    openingHours: {
      monday: '08:00-21:00',
      tuesday: '08:00-21:00',
      wednesday: '08:00-21:00',
      thursday: '08:00-21:00',
      friday: '08:00-21:00',
      saturday: '09:00-21:00',
      sunday: '09:00-17:00',
    },
    publishedAt: new Date(),
  };

  if (existing) return prisma.website.update({ where: { id: existing.id }, data });
  return prisma.website.create({ data: { tenantId, ...data } });
}

async function seedMenus(tenantId: string, websiteId: string, demo: DemoTenant) {
  for (const [categoryIndex, category] of demo.categories.entries()) {
    const menuCategory = await prisma.menuCategory.upsert({
      where: {
        tenantId_websiteId_name: {
          tenantId,
          websiteId,
          name: category.name,
        },
      },
      update: { sortOrder: categoryIndex },
      create: {
        tenantId,
        websiteId,
        name: category.name,
        sortOrder: categoryIndex,
      },
    });

    for (const [itemIndex, item] of category.items.entries()) {
      const existing = await prisma.menu.findFirst({ where: { tenantId, websiteId, name: item.name } });
      const data = {
        categoryId: menuCategory.id,
        description: item.description,
        price: new Prisma.Decimal(item.price),
        imageUrl: item.imageUrl,
        sortOrder: itemIndex,
        status: ContentStatus.ACTIVE,
      };

      if (existing) {
        await prisma.menu.update({ where: { id: existing.id }, data });
      } else {
        await prisma.menu.create({
          data: {
            tenantId,
            websiteId,
            name: item.name,
            ...data,
          },
        });
      }
    }
  }
}

async function seedGallery(tenantId: string, websiteId: string, demo: DemoTenant) {
  for (const [index, item] of demo.gallery.entries()) {
    const existing = await prisma.gallery.findFirst({ where: { tenantId, websiteId, imageUrl: item.imageUrl } });
    const data = {
      category: item.category,
      altText: item.altText,
      sortOrder: index,
      status: ContentStatus.ACTIVE,
    };

    if (existing) {
      await prisma.gallery.update({ where: { id: existing.id }, data });
    } else {
      await prisma.gallery.create({
        data: {
          tenantId,
          websiteId,
          imageUrl: item.imageUrl,
          ...data,
        },
      });
    }
  }
}

async function seedReviews(tenantId: string, websiteId: string, demo: DemoTenant) {
  for (const review of demo.reviews) {
    const existing = await prisma.review.findFirst({ where: { tenantId, websiteId, customerName: review.customerName } });
    const data = {
      rating: review.rating,
      comment: review.comment,
      source: ReviewSource.INTERNAL,
      status: ReviewStatus.PUBLISHED,
    };

    if (existing) {
      await prisma.review.update({ where: { id: existing.id }, data });
    } else {
      await prisma.review.create({
        data: {
          tenantId,
          websiteId,
          customerName: review.customerName,
          ...data,
        },
      });
    }
  }
}

function templateSchemaFor(businessType: BusinessType) {
  const sectionsByType: Record<BusinessType, string[]> = {
    WARTEG: ['hero', 'about', 'menu', 'reviews', 'gallery', 'location', 'contact'],
    RESTAURANT: ['hero', 'about', 'menu', 'reviews', 'gallery', 'location', 'contact'],
    CAFE: ['hero', 'about', 'menu', 'reviews', 'gallery', 'location', 'contact'],
    LAUNDRY: ['hero', 'services', 'pricing', 'pickup', 'reviews', 'faq', 'contact'],
    WORKSHOP: ['hero', 'services', 'pricing', 'reviews', 'contact'],
    CLINIC: ['hero', 'doctors', 'services', 'schedule', 'reviews', 'contact'],
    SALON: ['hero', 'services', 'pricing', 'gallery', 'reviews', 'contact'],
    RETAIL: ['hero', 'products', 'promos', 'reviews', 'contact'],
    LOCAL_SERVICE: ['hero', 'services', 'pricing', 'reviews', 'contact'],
  };

  return {
    sections: sectionsByType[businessType],
    source: 'demo-seed',
  };
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
