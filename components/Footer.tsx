import React from "react";

interface FooterProps {
  onNavigate?: (view: string, params?: any) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const navigate = (view: string, params?: any) => {
    if (onNavigate) onNavigate(view, params);
  };

  return (
    <footer className="bg-brand-page pt-28 pb-14 border-t border-white/5 relative z-10">
      <div className="max-w-7xl mx-auto px-4 md:px-8">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-14 mb-24">
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5 mb-10">
              <span className="material-symbols-outlined text-brand-secondary text-4xl">token</span>
              <span className="text-2xl font-black text-white tracking-tighter font-display uppercase italic">AvN Tech Solution</span>
            </div>
            <p className="text-gray-500 leading-relaxed mb-12 text-base font-medium">
              Top-quality technology ready for your home or office. Experience a better way to get the latest tech.
            </p>
            <div className="flex gap-5">
              {[
                {
                  name: 'Instagram',
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003h.002zm-.003 1.441c2.137 0 2.389.008 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.844.047 1.097.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.985 1.644a4.59 4.59 0 1 0 0 9.18 4.59 4.59 0 0 0 0-9.18zm0 1.566a3.024 3.024 0 1 1 0 6.048 3.024 3.024 0 0 1 0-6.048z" />
                    </svg>
                  )
                },
                {
                  name: 'Facebook',
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z" />
                    </svg>
                  )
                },
                {
                  name: 'WhatsApp',
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.06 3.978l-1.125 4.113 4.212-1.105a7.95 7.95 0 0 0 3.785.955h.005c4.366 0 7.923-3.558 7.927-7.929a7.948 7.948 0 0 0-2.324-5.613zM10.974 12.93c-.23.158-.701.306-1.013.335-.286.026-.565.114-1.61-.31a6.398 6.398 0 0 1-2.906-2.585l-.105-.174a4.803 4.803 0 0 1-.954-2.553c.01-.833.433-1.24.577-1.428.145-.187.319-.234.425-.234.106 0 .212.001.304.006.113.004.26-.042.408.312.148.354.507 1.235.551 1.323.044.088.073.19.015.308l-.161.327c-.05.105-.104.22-.054.308.05.088.223.367.479.594.33.292.608.381.704.425.096.044.153.036.21-.027l.21-.246c.063-.074.136-.063.228-.029.091.033.58.274.68.324.1.05.167.075.192.117.025.042.025.244-.108.336z" />
                    </svg>
                  )
                }
              ].map((social) => (
                <a
                  key={social.name}
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all duration-300 border border-white/10 hover:scale-110"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-black text-white mb-10 text-xs uppercase tracking-[0.4em]">Products</h4>
            <ul className="space-y-5 text-gray-500 font-bold text-xs uppercase tracking-widest">
              <li><button onClick={() => navigate('listing', { category: 'Laptop' })} className="hover:text-white transition-all duration-300 hover:translate-x-1">Laptops</button></li>
              <li><button onClick={() => navigate('listing', { category: 'Desktop' })} className="hover:text-white transition-all">Desktops</button></li>
              <li><button onClick={() => navigate('listing', { category: 'Monitor' })} className="hover:text-white transition-all">Monitors</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-white mb-8 text-[10px] uppercase tracking-[0.4em]">Company</h4>
            <ul className="space-y-4 text-gray-500 font-bold text-[10px] uppercase tracking-widest">
              <li><button onClick={() => navigate('support-portal', { tab: 'centers' })} className="hover:text-white transition-all">Centers</button></li>
              <li><button onClick={() => navigate('about')} className="hover:text-white transition-all">About AvN Tech Solution</button></li>
              <li><button onClick={() => navigate('info', { page: 'rental-guide' })} className="hover:text-white transition-all">How it Works</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-white mb-8 text-[10px] uppercase tracking-[0.4em]">Support</h4>
            <ul className="space-y-4 text-gray-500 font-bold text-[10px] uppercase tracking-widest">
              <li><button onClick={() => navigate('contact')} className="hover:text-white transition-all">Contact Us</button></li>
              <li><button onClick={() => navigate('info', { page: 'terms' })} className="hover:text-white transition-all">Terms of Service</button></li>
              <li><button onClick={() => navigate('info', { page: 'privacy' })} className="hover:text-white transition-all">Privacy Policy</button></li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex flex-wrap gap-8">
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-brand-secondary transition-all duration-300 group-hover:scale-110">
                <span className="material-symbols-outlined">chat_bubble</span>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-0.5">Customer Support</p>
                <p className="text-white font-black text-sm tracking-tight">+91 1800-AvN-TECH</p>
              </div>
            </div>
          </div>

          <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em]">
            © 2026 AvN Tech Solution Private Limited. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}