import { Frame, Navigation } from "@shopify/polaris";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  HomeMajor,
  OrdersMajor,
  ProductsMajor,
  SettingsMajor,
  EmailMajor,
  CreditCardMajor,
  NoteMajor,
  QuestionMarkMajor
} from "@shopify/polaris-icons";

export default function Layout({ children }) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems = [
    {
      url: "/",
      label: "Home",
      icon: HomeMajor,
      selected: location.pathname === "/",
      onClick: () => navigate("/")
    },
    {
      url: "/orders",
      label: t("NavigationMenu.orders"),
      icon: OrdersMajor,
      selected: location.pathname === "/orders",
      onClick: () => navigate("/orders")
    },
    {
      url: "/products",
      label: t("NavigationMenu.products"),
      icon: ProductsMajor,
      selected: location.pathname === "/products",
      onClick: () => navigate("/products")
    },
    {
      url: "/invoice_templates",
      label: t("NavigationMenu.invoice_templates"),
      icon: NoteMajor,
      selected: location.pathname === "/invoice_templates",
      onClick: () => navigate("/invoice_templates")
    },
    {
      url: "/settings",
      label: t("NavigationMenu.settings"),
      icon: SettingsMajor,
      selected: location.pathname === "/settings",
      onClick: () => navigate("/settings")
    },
    {
      url: "/email-settings",
      label: t("NavigationMenu.email-settings"),
      icon: EmailMajor,
      selected: location.pathname === "/email-settings",
      onClick: () => navigate("/email-settings")
    },
    {
      url: "/plans_and_billings",
      label: t("NavigationMenu.plans_and_billings"),
      icon: CreditCardMajor,
      selected: location.pathname === "/plans_and_billings",
      onClick: () => navigate("/plans_and_billings")
    },
    {
      url: "/contactus",
      label: t("NavigationMenu.contactus"),
      icon: QuestionMarkMajor,
      selected: location.pathname === "/contactus",
      onClick: () => navigate("/contactus")
    }
  ];

  return (
    <Frame
      navigation={
        <Navigation location={location.pathname}>
          <Navigation.Section
            items={navigationItems}
          />
        </Navigation>
      }
    >
      {children}
    </Frame>
  );
}
