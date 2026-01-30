import Link from 'next/link';
import { FC, ReactElement } from 'react';
import { Github, Globe } from 'lucide-react';

interface FooterLink {
    label: string;
    href: string;
}

interface FooterSection {
    title: string;
    links: FooterLink[];
}

interface SocialLink {
    icon: ReactElement;
    href: string;
    label: string;
}

const Footer: FC = (): ReactElement => {
    const productLinks: FooterLink[] = [
        { label: 'Features', href: '#' },
        { label: 'Integrations', href: '#' },
        { label: 'Pricing', href: '#' },
        { label: 'Changelog', href: '#' },
    ];

    const resourceLinks: FooterLink[] = [
        { label: 'Documentation', href: '#' },
        { label: 'API Reference', href: '#' },
        { label: 'Community', href: '#' },
        { label: 'Blog', href: '#' },
    ];

    const legalLinks: FooterLink[] = [
        { label: 'Privacy', href: '#' },
        { label: 'Terms', href: '#' },
        { label: 'Security', href: '#' },
    ];

    const sections: FooterSection[] = [
        { title: 'Product', links: productLinks },
        { title: 'Resources', links: resourceLinks },
    ];

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
        <footer className="max-w-[430px] mx-auto bg-slate-950 text-slate-400 py-8 border-t border-slate-900">
            <div className="max-w-[430px] mx-auto px-4">
                {/* Brand Section */}
                <div className="mb-8 text-center">
                    <div className="flex items-center justify-center gap-2 mb-3 text-white">
                        <div className="relative w-10 h-10 flex items-center justify-center">
                            <img src="/logo_hooklab.png" alt="Logo HookLab AI" />
                        </div>
                        <span className="font-bold text-xl">HookLab AI</span>
                    </div>
                    <p className="text-xs leading-relaxed mb-6 px-4">
                        Empowering
                    </p>

                    {/* Social Links */}
                    <div className="flex gap-4 justify-center">
                        {socialLinks.map((social) => (
                            <Link
                                key={social.label}
                                href={social.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-400 hover:text-white transition-colors active:scale-95"
                                aria-label={social.label}
                            >
                                {social.icon}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Links Grid - Mobile Optimized */}
                <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
                    {sections.map((section) => (
                        <div key={section.title}>
                            <h4 className="font-semibold text-white mb-3 text-sm">{section.title}</h4>
                            <ul className="space-y-2 text-xs">
                                {section.links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            href={link.href}
                                            className="hover:text-indigo-400 transition-colors active:text-indigo-500"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Legal Links - Stacked for Mobile */}
                <div className="mb-6">
                    <h4 className="font-semibold text-white mb-3 text-sm text-center">Legal</h4>
                    <ul className="flex justify-center gap-4 text-xs flex-wrap">
                        {legalLinks.map((link) => (
                            <li key={link.label}>
                                <Link
                                    href={link.href}
                                    className="hover:text-indigo-400 transition-colors active:text-indigo-500"
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Copyright */}
                <div className="pt-6 border-t border-slate-900 text-center">
                    <p className="text-xs text-slate-500">
                        &copy; 2026 HookLab AI. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;