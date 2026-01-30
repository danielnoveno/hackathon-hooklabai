import Link from 'next/link';
import { FC, ReactElement } from 'react';
import { Github, Globe } from 'lucide-react';

interface SocialLink {
    icon: ReactElement;
    href: string;
    label: string;
}

const Footer: FC = (): ReactElement => {
    const socialLinks: SocialLink[] = [
        {
            icon: <Github className="w-5 h-5" />,
            href: 'https://github.com/danielnoveno/hackathon-hooklabai',
            label: 'GitHub Repository'
        },
        {
            icon: <Globe className="w-5 h-5" />,
            href: 'https://your-app-url.com',
            label: 'Live Demo'
        },
    ];

    return (
        <footer className="relative w-full bg-black text-slate-400 py-12 border-t border-white/10">
            <div className="max-w-6xl mx-auto px-6">
                {/* Brand Section */}
                <div className="mb-8 text-center">
                    <div className="flex items-center justify-center gap-2 mb-4 text-white">
                        <div className="relative w-10 h-10 flex items-center justify-center">
                            <img src="/logo_hooklab.png" alt="Logo HookLab AI" />
                        </div>
                        <span className="font-bold text-xl">HookLab AI</span>
                    </div>

                    {/* Social Links */}
                    <div className="flex gap-4 justify-center mb-8">
                        {socialLinks.map((social) => (
                            <Link
                                key={social.label}
                                href={social.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-400 hover:text-blue-400 transition-colors active:scale-95"
                                aria-label={social.label}
                            >
                                {social.icon}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Copyright */}
                <div className="text-center">
                    <p className="text-xs text-slate-500">
                        © 2026 HookLab AI. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
