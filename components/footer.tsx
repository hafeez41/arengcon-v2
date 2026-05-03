export function Footer() {
  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-4 px-5 py-6 text-[10px] uppercase tracking-[0.18em] md:flex-row md:items-center md:justify-between md:px-10 md:py-5">
        <div className="flex items-center gap-6">
          <span>© 2013 Arengcon</span>
          <span className="hidden text-ink/55 sm:inline">Est. 2008</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="/about" className="hover-line" data-cursor="hover">
            About
          </a>
          <a href="/contact" className="hover-line" data-cursor="hover">
            Contact
          </a>
          <a
            href="mailto:hello@arengcon.com"
            data-spa-skip
            className="hover-line"
            data-cursor="hover"
          >
            hello@arengcon.com
          </a>
        </div>
      </div>
    </footer>
  );
}
