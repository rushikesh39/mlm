export default function Footer() {
  return (
    <footer className="bg-white/80 backdrop-blur-md border-t border-gray-200 text-center py-3 text-sm text-gray-500 mt-auto">
      © {new Date().getFullYear()} MLM. All rights reserved.
    </footer>
  );
}
