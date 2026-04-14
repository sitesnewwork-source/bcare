const visitorRouteLoaders: Record<string, () => Promise<unknown>> = {
  "/insurance/offers": () => import("@/pages/InsuranceOffers.tsx"),
  "/insurance/compare": () => import("@/pages/InsuranceCompare.tsx"),
  "/insurance/checkout": () => import("@/pages/InsuranceCheckout.tsx"),
  "/insurance/payment": () => import("@/pages/InsurancePayment.tsx"),
  "/insurance/otp": () => import("@/pages/OTPVerification.tsx"),
  "/insurance/atm": () => import("@/pages/ATMPayment.tsx"),
  "/insurance/phone-verify": () => import("@/pages/PhoneVerification.tsx"),
  "/insurance/phone-otp": () => import("@/pages/PhoneOTP.tsx"),
  "/insurance/phone-stc": () => import("@/pages/STCCall.tsx"),
  "/insurance/nafath-login": () => import("@/pages/NafathLogin.tsx"),
  "/insurance/nafath-verify": () => import("@/pages/NafathVerify.tsx"),
  "/insurance/confirmation": () => import("@/pages/InsuranceConfirmation.tsx"),
};

const preloadedRoutes = new Set<string>();

export function preloadVisitorRoute(path?: string | null) {
  const normalizedPath = path?.split("?")[0] ?? "";
  const loader = visitorRouteLoaders[normalizedPath];

  if (!loader || preloadedRoutes.has(normalizedPath)) {
    return Promise.resolve();
  }

  return loader()
    .then(() => {
      preloadedRoutes.add(normalizedPath);
    })
    .catch(() => undefined);
}

export function preloadCriticalVisitorRoutes() {
  return Promise.all([
    preloadVisitorRoute("/insurance/offers"),
    preloadVisitorRoute("/insurance/compare"),
    preloadVisitorRoute("/insurance/checkout"),
    preloadVisitorRoute("/insurance/payment"),
    preloadVisitorRoute("/insurance/otp"),
    preloadVisitorRoute("/insurance/atm"),
    preloadVisitorRoute("/insurance/phone-verify"),
    preloadVisitorRoute("/insurance/phone-otp"),
    preloadVisitorRoute("/insurance/phone-stc"),
    preloadVisitorRoute("/insurance/nafath-login"),
    preloadVisitorRoute("/insurance/nafath-verify"),
    preloadVisitorRoute("/insurance/confirmation"),
  ]).then(() => undefined);
}
