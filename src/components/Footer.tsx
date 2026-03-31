const Footer = () => {
  return (
    <footer className="bg-primary/95 text-primary-foreground py-6 pb-20 md:pb-6">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-primary-foreground/50">
          © 2026 تري للتأمين. جميع الحقوق محفوظة.
        </p>
        <div className="flex gap-4">
          <a href="#" className="text-xs text-primary-foreground/50 hover:text-primary-foreground transition-colors">إشعار الخصوصية</a>
          <a href="#" className="text-xs text-primary-foreground/50 hover:text-primary-foreground transition-colors">الشروط والأحكام</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
