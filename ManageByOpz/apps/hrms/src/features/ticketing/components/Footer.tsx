import React from "react";

const Facebook = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
);
const Twitter = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
);
const Linkedin = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
);
const Youtube = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" /><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" /></svg>
);
const Instagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
);

const footerLinks = [
 {
 title:"Products",
 links: ["Platform","IT Service Management","IT Operations Management","Strategic Portfolio Management","Security Operations"],
 },
 {
 title:"Solutions",
 links: ["Technology Excellence","Customer Experience","Employee Experience","Operating Excellence","Industry Solutions"],
 },
 {
 title:"Company",
 links: ["About Us","Careers","Newsroom","Events","Investor Relations"],
 },
 {
 title:"Support",
 links: ["Customer Support","Product Documentation","Community","Developer Program","Training & Certification"],
 },
];

export function Footer() {
 return (
 <footer className="bg-sn-dark pt-20 pb-10 text-white">
 <div className="container mx-auto px-4 lg:px-8">
 <div className="grid gap-12 lg:grid-cols-5">
 <div className="lg:col-span-1">
 <a href="/" className="mb-8 block">
 <span className="text-2xl font-bold tracking-tighter text-sn-green">
 Manage My Desk
 </span>
 </a>
 <p className="mb-8 text-sm text-gray-400">
 Manage My Desk is making the world of work, work better for people. Our cloud-based platform and solutions deliver digital workflows that create great experiences and unlock productivity.
 </p>
 <div className="flex gap-4">
 <a href="#" className="text-gray-400 hover:text-sn-green"><Linkedin className="h-5 w-5" /></a>
 <a href="#" className="text-gray-400 hover:text-sn-green"><Twitter className="h-5 w-5" /></a>
 <a href="#" className="text-gray-400 hover:text-sn-green"><Facebook className="h-5 w-5" /></a>
 <a href="#" className="text-gray-400 hover:text-sn-green"><Youtube className="h-5 w-5" /></a>
 <a href="#" className="text-gray-400 hover:text-sn-green"><Instagram className="h-5 w-5" /></a>
 </div>
 </div>
 
 {footerLinks.map((section, index) => (
 <div key={index}>
 <h4 className="mb-6 text-sm font-bold uppercase tracking-widest text-white">
 {section.title}
 </h4>
 <ul className="space-y-4 text-sm text-gray-400">
 {section.links.map((link, linkIndex) => (
 <li key={linkIndex}>
 <a href="#" className="hover:text-sn-green hover:underline">
 {link}
 </a>
 </li>
 ))}
 </ul>
 </div>
 ))}
 </div>
 
 <div className="mt-20 border-t border-white/10 pt-10 text-center text-xs text-gray-500">
 <div className="mb-4 flex flex-wrap justify-center gap-6">
 <a href="#" className="hover:text-white">Privacy Statement</a>
 <a href="#" className="hover:text-white">Terms of Use</a>
 <a href="#" className="hover:text-white">Cookie Policy</a>
 <a href="#" className="hover:text-white">Sitemap</a>
 <a href="#" className="hover:text-white">Modern Slavery Statement</a>
 </div>
 <p>© 2024 Manage My Desk, Inc. All rights reserved.</p>
 </div>
 </div>
 </footer>
 );
}
