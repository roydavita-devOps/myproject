import { createElement, Fragment } from 'react';
import { Website } from '../../../types/api';
import {
  TemplateCTASection,
  TemplateContactSection,
  TemplateFeatureSection,
  TemplateFooter,
  TemplateGallery,
  TemplateHero,
  TemplateLocationSection,
  TemplateNavigation,
  TemplatePricingBlock,
  TemplateServiceList,
  TemplateTestimonials,
} from '../TemplateComponents';
import { RestaurantTemplate } from '../RestaurantTemplate';
import { LaundryTemplate } from '../LaundryTemplate';
import { ClinicTemplate } from '../ClinicTemplate';
import { CorporateTemplate } from '../CorporateTemplate';
import { CafeTemplate } from '../CafeTemplate';
import { defaultTemplateKey, templateMetadata } from './templateMetadata';
import { TemplateRenderer, TemplateRendererKey } from './templateTypes';

function GenericBusinessTemplate({ website }: { website: Website }) {
  return createElement(
    Fragment,
    null,
    createElement(TemplateNavigation, { website }),
    createElement(TemplateHero, { website }),
    createElement(TemplateFeatureSection, { website }),
    createElement(TemplateServiceList, { items: website.menus ?? [] }),
    createElement(TemplatePricingBlock, { items: website.menus ?? [] }),
    createElement(TemplateGallery, { items: website.galleries ?? [], businessName: website.businessName }),
    createElement(TemplateTestimonials, { reviews: website.reviews ?? [] }),
    createElement(TemplateLocationSection, { website }),
    createElement(TemplateCTASection, { website }),
    createElement(TemplateContactSection, { website }),
    createElement(TemplateFooter, { website }),
  );
}

const renderers: Record<TemplateRendererKey, TemplateRenderer> = {
  restaurant: RestaurantTemplate,
  laundry: LaundryTemplate,
  clinic: ClinicTemplate,
  corporate: CorporateTemplate,
  cafe: CafeTemplate,
  generic_business: GenericBusinessTemplate,
};

export const templateRegistry = {
  metadata: templateMetadata,
  defaultTemplateKey,
  getRenderer(rendererKey: TemplateRendererKey) {
    return renderers[rendererKey] ?? renderers.generic_business;
  },
};
