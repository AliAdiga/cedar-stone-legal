"use client";
import { useState, useEffect, useRef, ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Scroll-triggered reveal, GSAP-powered (replaces the old IntersectionObserver + CSS version).
function Reveal({ children, className = "", delay = 0, style = {}, from = { y: 40 } }: { children: ReactNode; className?: string; delay?: number; style?: React.CSSProperties; from?: gsap.TweenVars; }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    if (prefersReducedMotion()) { gsap.set(el, { autoAlpha: 1, y: 0, rotation: 0 }); return; }
    const ctx = gsap.context(() => {
      gsap.fromTo(el, { autoAlpha: 0, ...from }, {
        autoAlpha: 1, y: 0, rotation: 0, duration: 0.9, delay, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none reverse" },
      });
    });
    return () => ctx.revert();
  }, [delay]);
  return <div ref={ref} className={`reveal-el ${className}`} style={{ opacity: 0, ...style }}>{children}</div>;
}

// Large, low-opacity section number sitting behind headings — the "editorial ghost number" look,
// with a subtle scroll-driven parallax float of its own.
function GhostNum({ n, color }: { n: string; color: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.to(el, { yPercent: -18, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1 } });
    });
    return () => ctx.revert();
  }, []);
  return (
    <span ref={ref} aria-hidden="true" style={{ position: "absolute", top: "-2.2rem", left: "50%", transform: "translateX(-50%)", fontSize: "clamp(4.5rem,11vw,9rem)", fontWeight: 700, color, opacity: 0.07, letterSpacing: "-0.02em", pointerEvents: "none", zIndex: 0, whiteSpace: "nowrap", fontFamily: "var(--font-cormorant), serif" }}>{n}</span>
  );
}

// Wraps a button/link so it drifts gently toward the cursor — the "magnetic CTA" micro-interaction.
function Magnetic({ children, strength = 0.35 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el || prefersReducedMotion()) return;
    const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3" });
    const move = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * strength);
      yTo((e.clientY - r.top - r.height / 2) * strength);
    };
    const leave = () => { xTo(0); yTo(0); };
    el.addEventListener("mousemove", move);
    el.addEventListener("mouseleave", leave);
    return () => { el.removeEventListener("mousemove", move); el.removeEventListener("mouseleave", leave); };
  }, [strength]);
  return <div ref={ref} style={{ display: "inline-block" }}>{children}</div>;
}

const Icon = {
  scaleSm: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="3" x2="12" y2="21"/><path d="M3 9l9-6 9 6"/><path d="M6 12H3l-1.5 6h7L7 12z"/><path d="M18 12h3l1.5 6h-7L17 12z"/></svg>,
  scale: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="3" x2="12" y2="21"/><path d="M3 9l9-6 9 6"/><path d="M6 12H3l-1.5 6h7L7 12z"/><path d="M18 12h3l1.5 6h-7L17 12z"/></svg>,
  heart: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  briefcase: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  home: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  gavel: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2L2 14l4 4L18 6z"/><path d="M18 6l2 2-8 8"/><line x1="3" y1="22" x2="21" y2="22"/></svg>,
  check: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  arrow: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  phone: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.58 3.44 2 2 0 0 1 3.55 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.18 6.18l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  mail: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  map: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  menu: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  close: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  star: <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  quote: <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>,
  search: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  globe: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  chatBubble: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  arrowUp: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>,
  chevDown: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  chevLeft: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  chevRight: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  clock: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  send: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  whatsapp: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>,
};

type Lang = "en" | "ar";
type Msg = { role: "user" | "bot"; text: string };

const T: Record<Lang, any> = {
  en: {
    navLinks: ["About", "Practice Areas", "Team", "Blog", "FAQ", "Contact"],
    navCta: "Free Consultation",
    heroTag: "Trusted Legal Counsel",
    heroTitle1: "The Law,", heroTitle2: "On Your Side.",
    heroDesc: "Cedar Stone Legal provides clear, compassionate, and results-driven legal services for individuals, families, and businesses.",
    heroCta1: "Book Free Consultation", heroCta2: "Our Practice Areas",
    heroCardTitle: "Over 20 Years of Legal Excellence",
    heroCardDesc: "Serving clients with trusted, principled legal representation since 2004.",
    heroStats: [{ v: "1,200+", l: "Happy Clients" }, { v: "94%", l: "Success Rate" }, { v: "20+", l: "Years Exp." }, { v: "4", l: "Practice Areas" }],
    heroBadgeTitle: "Free First Consultation", heroBadgeSub: "No obligation · Confidential",
    aboutTag: "About Our Firm",
    aboutTitle: "Legal Guidance Built on Trust & Experience",
    aboutQuote: '"Justice is not just a principle — it\'s a promise."',
    aboutQuoteSub: "— Cedar Stone Legal, est. 2004",
    aboutP1: "Cedar Stone Legal was founded in 2004 with a clear mission: to provide every client with the same quality of legal representation once reserved only for corporations and the privileged few.",
    aboutP2: "Our team brings deep expertise across family law, corporate matters, estate planning, and civil litigation — always guided by integrity, transparency, and a genuine commitment to your best outcome.",
    aboutChecks: ["Client-first approach in everything we do", "Clear, jargon-free communication", "Fixed and transparent pricing options", "Same-week consultations available"],
    established: "Established", yearsOfTrust: "20 years of trust",
    practiceTag: "What We Do", practiceTitle: "Our Practice Areas",
    practiceDesc: "From courtroom advocacy to careful estate planning — expert legal guidance across the areas that matter most.",
    teamTag: "Our People", teamTitle: "Meet the Team", teamDesc: "Experienced attorneys committed to delivering results.", yearsExp: "yrs exp",
    whyTag: "Why Cedar Stone", whyTitle1: "The Difference Is in", whyTitle2: "How We Work",
    testiTag: "Client Stories", testiTitle: "What Our Clients Say",
    faqTag: "Have Questions?", faqTitle: "Frequently Asked Questions", faqDesc: "Answers to the questions we hear most often.",
    blogTag: "Legal Insights", blogTitle: "From Our Blog", blogDesc: "Practical legal guidance written in plain language.", readMore: "Read Article", minRead: "min read",
    contactTag: "Get In Touch", contactTitle: "Book Your Free Consultation",
    contactDesc: "Take the first step. We'll be in touch within one business day.",
    formTab: "Send a Message", calTab: "Pick a Date",
    calDesc: "Choose a date and time — we'll confirm within 24 hours.",
    calConfirm: "Confirm Appointment", calConfirmed: "Appointment Requested!",
    calConfirmedDesc: "We'll contact you to confirm your appointment time.",
    timeSlots: ["9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"],
    monthNames: ["January","February","March","April","May","June","July","August","September","October","November","December"],
    dayNames: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],
    contactInfoTitle: "Cedar Stone Legal",
    contactInfoDesc: "We're here to help. Reach out through any channel below or use the form.",
    officeHours: "Office Hours", hours1: "Sun – Thu: 8:00 AM – 5:00 PM", hours2: "Sat: 9:00 AM – 1:00 PM",
    fName: "Full Name", fEmail: "Email Address", fPhone: "Phone Number",
    fService: "Practice Area", fMessage: "How Can We Help?", fSubmit: "Send Message",
    fPrivacy: "Your information is confidential and protected by attorney-client privilege.",
    fSuccess: "Message Received!", fSuccessDesc: "Thank you for reaching out. A member of our team will contact you within one business day.",
    pName: "Sarah Johnson", pEmail: "sarah@example.com", pPhone: "+962 7X XXX XXXX",
    pService: "Select a practice area...", pMessage: "Briefly describe your legal matter...",
    services: ["Family Law", "Corporate & Business", "Estate Planning", "Civil Litigation", "Other"],
    footerDesc: "Trusted legal counsel for every chapter of life. Serving individuals, families, and businesses since 2004.",
    footerCol1Title: "Practice Areas", footerCol1Links: ["Family Law", "Corporate & Business", "Estate Planning", "Civil Litigation"],
    footerCol2Title: "Firm", footerCol2Links: ["About Us", "Our Team", "Legal Blog", "Contact"],
    footerRights: "Cedar Stone Legal. All rights reserved.",
    footerLegal: ["Privacy Policy", "Terms of Service", "Disclaimer"],
    chatTitle: "Chat with Us", chatSub: "Typically replies in minutes",
    chatWelcome: "Hello! Welcome to Cedar Stone Legal 👋 How can we help you today?",
    chatPlaceholder: "Type a message...",
    cookieText: "We use cookies to improve your experience on our site.",
    cookieAccept: "Accept All", cookieDecline: "Decline",
    searchPlaceholder: "Search practice areas, FAQ...", searchNoResults: "No results found",
  },
  ar: {
    navLinks: ["من نحن", "مجالات الممارسة", "الفريق", "المدونة", "الأسئلة الشائعة", "تواصل معنا"],
    navCta: "استشارة مجانية",
    heroTag: "استشارة قانونية موثوقة",
    heroTitle1: "القانون،", heroTitle2: "في صفّك.",
    heroDesc: "تقدم سيدار ستون ليغال خدمات قانونية واضحة وشاملة وموجهة نحو النتائج للأفراد والعائلات والشركات.",
    heroCta1: "احجز استشارة مجانية", heroCta2: "مجالات ممارستنا",
    heroCardTitle: "أكثر من 20 عاماً من التميز القانوني",
    heroCardDesc: "نخدم عملاءنا بتمثيل قانوني موثوق ومبدئي منذ عام 2004.",
    heroStats: [{ v: "+1,200", l: "عميل راضٍ" }, { v: "94%", l: "نسبة النجاح" }, { v: "+20", l: "سنة خبرة" }, { v: "4", l: "مجالات" }],
    heroBadgeTitle: "استشارة أولى مجانية", heroBadgeSub: "بدون التزام · سري تام",
    aboutTag: "عن مكتبنا",
    aboutTitle: "إرشاد قانوني مبني على الثقة والخبرة",
    aboutQuote: '"العدالة ليست مجرد مبدأ — إنها وعد."',
    aboutQuoteSub: "— سيدار ستون ليغال، تأسس 2004",
    aboutP1: "تأسس مكتب سيدار ستون ليغال عام 2004 برسالة واضحة: تقديم نفس جودة التمثيل القانوني التي كانت حكراً على الشركات الكبرى لكل عميل.",
    aboutP2: "يجمع فريقنا خبرة عميقة في قانون الأسرة والشؤون التجارية والتخطيط العقاري والتقاضي المدني — دائماً بتوجيه من النزاهة والشفافية.",
    aboutChecks: ["نهج يضع العميل أولاً دائماً", "تواصل واضح خالٍ من المصطلحات", "أسعار ثابتة وشفافة", "استشارات متاحة في نفس الأسبوع"],
    established: "تأسس", yearsOfTrust: "20 عاماً من الثقة",
    practiceTag: "ماذا نقدم", practiceTitle: "مجالات ممارستنا",
    practiceDesc: "من المناصرة في المحاكم إلى التخطيط العقاري — إرشاد قانوني متخصص في المجالات الأكثر أهمية.",
    teamTag: "فريقنا", teamTitle: "تعرف على الفريق", teamDesc: "محامون ذوو خبرة ملتزمون بتحقيق أفضل النتائج.", yearsExp: "سنة خبرة",
    whyTag: "لماذا سيدار ستون", whyTitle1: "الفرق يكمن في", whyTitle2: "طريقة عملنا",
    testiTag: "قصص العملاء", testiTitle: "ماذا يقول عملاؤنا",
    faqTag: "لديك أسئلة؟", faqTitle: "الأسئلة الشائعة", faqDesc: "إجابات على الأسئلة التي نسمعها أكثر.",
    blogTag: "رؤى قانونية", blogTitle: "من مدونتنا", blogDesc: "إرشادات قانونية عملية مكتوبة بلغة بسيطة.", readMore: "اقرأ المقال", minRead: "دقائق قراءة",
    contactTag: "تواصل معنا", contactTitle: "احجز استشارتك المجانية",
    contactDesc: "ابدأ الخطوة الأولى. سنتواصل معك خلال يوم عمل واحد.",
    formTab: "أرسل رسالة", calTab: "اختر موعداً",
    calDesc: "اختر تاريخاً ووقتاً — سنؤكد خلال 24 ساعة.",
    calConfirm: "تأكيد الموعد", calConfirmed: "تم طلب الموعد!",
    calConfirmedDesc: "سنتواصل معك على رقمك لتأكيد الموعد.",
    timeSlots: ["9:00 ص", "10:00 ص", "11:00 ص", "1:00 م", "2:00 م", "3:00 م", "4:00 م"],
    monthNames: ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"],
    dayNames: ["أح","إث","ثل","أر","خم","جم","سب"],
    contactInfoTitle: "سيدار ستون ليغال",
    contactInfoDesc: "نحن هنا للمساعدة. تواصل معنا عبر أي قناة أدناه أو استخدم النموذج.",
    officeHours: "ساعات العمل", hours1: "الأحد – الخميس: 8:00 ص – 5:00 م", hours2: "السبت: 9:00 ص – 1:00 م",
    fName: "الاسم الكامل", fEmail: "البريد الإلكتروني", fPhone: "رقم الهاتف",
    fService: "مجال الممارسة", fMessage: "كيف يمكننا مساعدتك؟", fSubmit: "إرسال الرسالة",
    fPrivacy: "معلوماتك سرية ومحمية بموجب امتياز المحامي-الموكل.",
    fSuccess: "تم استلام رسالتك!", fSuccessDesc: "شكراً لتواصلك. سيتواصل معك أحد أعضاء فريقنا خلال يوم عمل واحد.",
    pName: "سارة أحمد", pEmail: "sara@example.com", pPhone: "+962 7X XXX XXXX",
    pService: "اختر مجال الممارسة...", pMessage: "صف باختصار قضيتك القانونية...",
    services: ["قانون الأسرة", "الشركات والأعمال", "التخطيط العقاري", "التقاضي المدني", "أخرى"],
    footerDesc: "استشارات قانونية موثوقة لكل مرحلة من حياتك. نخدم الأفراد والعائلات والشركات منذ 2004.",
    footerCol1Title: "مجالات الممارسة", footerCol1Links: ["قانون الأسرة", "الشركات والأعمال", "التخطيط العقاري", "التقاضي المدني"],
    footerCol2Title: "المكتب", footerCol2Links: ["من نحن", "فريقنا", "المدونة القانونية", "تواصل معنا"],
    footerRights: "سيدار ستون ليغال. جميع الحقوق محفوظة.",
    footerLegal: ["سياسة الخصوصية", "شروط الخدمة", "إخلاء المسؤولية"],
    chatTitle: "تحدث معنا", chatSub: "يرد عادةً في غضون دقائق",
    chatWelcome: "مرحباً! أهلاً بك في سيدار ستون ليغال 👋 كيف يمكننا مساعدتك اليوم؟",
    chatPlaceholder: "اكتب رسالة...",
    cookieText: "نستخدم ملفات تعريف الارتباط لتحسين تجربتك على موقعنا.",
    cookieAccept: "قبول الكل", cookieDecline: "رفض",
    searchPlaceholder: "ابحث عن مجالات الممارسة، الأسئلة...", searchNoResults: "لا توجد نتائج",
  },
};

const practiceAreas = [
  { iconKey: "heart", title: { en: "Family Law", ar: "قانون الأسرة" }, desc: { en: "Compassionate guidance through divorce, custody, adoption, and all sensitive family matters. We protect what matters most.", ar: "إرشاد رحيم في قضايا الطلاق والحضانة والتبني وجميع شؤون الأسرة الحساسة." }, tags: { en: ["Divorce & Separation", "Child Custody", "Adoption", "Prenuptial Agreements"], ar: ["الطلاق والانفصال", "حضانة الأطفال", "التبني", "اتفاقيات ما قبل الزواج"] } },
  { iconKey: "briefcase", title: { en: "Corporate & Business", ar: "الشركات والأعمال" }, desc: { en: "Strategic legal counsel for startups, SMEs, and established companies — from formation through contracts and disputes.", ar: "استشارات قانونية استراتيجية للشركات الناشئة والمتوسطة والكبيرة — من التأسيس إلى العقود والنزاعات." }, tags: { en: ["Business Formation", "Contract Drafting", "Mergers & Acquisitions", "Commercial Disputes"], ar: ["تأسيس الشركات", "صياغة العقود", "الاندماج والاستحواذ", "النزاعات التجارية"] } },
  { iconKey: "home", title: { en: "Estate Planning", ar: "التخطيط العقاري" }, desc: { en: "Secure your family's future with thoughtfully crafted wills, trusts, and estate strategies tailored to your life.", ar: "أمّن مستقبل عائلتك بوصايا وصناديق ثروات وخطط عقارية مصممة خصيصاً لك." }, tags: { en: ["Wills & Trusts", "Probate", "Power of Attorney", "Guardianship"], ar: ["الوصايا والصناديق", "التحقق من الوصية", "توكيل قانوني", "الوصاية"] } },
  { iconKey: "gavel", title: { en: "Civil Litigation", ar: "التقاضي المدني" }, desc: { en: "Tenacious courtroom advocacy when disputes can't be resolved out of court. We fight for the outcome you deserve.", ar: "مناصرة قوية في المحاكم عندما لا يمكن حل النزاعات خارجها. نناضل من أجل النتيجة التي تستحقها." }, tags: { en: ["Contract Disputes", "Property Disputes", "Personal Injury", "Appeals"], ar: ["نزاعات العقود", "نزاعات الملكية", "إصابات شخصية", "الاستئنافات"] } },
];

const whyUs = [
  { num: "01", title: { en: "Personalized Attention", ar: "اهتمام شخصي" }, desc: { en: "You're never just a case number. Every client gets direct access to a senior attorney and a strategy built around their unique situation.", ar: "أنت لست مجرد رقم قضية. كل عميل يحصل على وصول مباشر لمحامٍ أول وخطة مبنية حول وضعه الفريد." } },
  { num: "02", title: { en: "Clear Communication", ar: "تواصل واضح" }, desc: { en: "Legal jargon can be overwhelming. We translate complex law into plain language so you're always informed and confident.", ar: "المصطلحات القانونية قد تكون مربكة. نترجم القانون المعقد إلى لغة بسيطة حتى تكون دائماً على دراية وثقة." } },
  { num: "03", title: { en: "Proven Track Record", ar: "سجل حافل بالنجاحات" }, desc: { en: "With over two decades of courtroom and negotiation experience, we bring disciplined, results-driven advocacy to every case.", ar: "بخبرة تمتد لأكثر من عقدين، نجلب مناصرة منضبطة وموجهة نحو النتائج لكل قضية." } },
];

const testimonials = [
  { name: "Sarah M.", role: "Family Law Client", text: "Cedar Stone Legal guided me through one of the hardest times of my life with genuine compassion and expertise. I felt fully supported every step of the way.", stars: 5 },
  { name: "David K.", role: "Business Owner", text: "Their corporate team helped us structure our partnership and navigate a complex acquisition. Thorough, professional, and always reachable when we needed them.", stars: 5 },
  { name: "Elena R.", role: "Estate Planning Client", text: "Finally a firm that makes estate planning feel manageable. They were patient with every question and produced a plan I feel completely confident about.", stars: 5 },
];

const team = [
  { name: { en: "Ahmad Al-Rashid", ar: "أحمد الراشد" }, role: { en: "Senior Partner", ar: "شريك أول" }, spec: { en: "Corporate & Business", ar: "الشركات والأعمال" }, initials: "AR", color: "#1C3530", exp: 18 },
  { name: { en: "Layla Hassan", ar: "ليلى حسن" }, role: { en: "Partner", ar: "شريكة" }, spec: { en: "Family Law", ar: "قانون الأسرة" }, initials: "LH", color: "#2D5A4A", exp: 14 },
  { name: { en: "Omar Khalil", ar: "عمر خليل" }, role: { en: "Senior Associate", ar: "محامٍ أول" }, spec: { en: "Civil Litigation", ar: "التقاضي المدني" }, initials: "OK", color: "#B8763A", exp: 10 },
  { name: { en: "Nour Mansour", ar: "نور منصور" }, role: { en: "Associate", ar: "محامية" }, spec: { en: "Estate Planning", ar: "التخطيط العقاري" }, initials: "NM", color: "#5A3E28", exp: 7 },
];

const faqs = [
  { q: { en: "What is the cost of a consultation?", ar: "ما هي تكلفة الاستشارة؟" }, a: { en: "Your first consultation is completely free with no obligation. After that, fees vary depending on the complexity of your case. We offer transparent, fixed-fee arrangements where possible.", ar: "استشارتك الأولى مجانية تماماً وبدون أي التزام. بعد ذلك، تتفاوت الرسوم حسب تعقيد قضيتك. نحن نقدم ترتيبات رسوم ثابتة وشفافة حيثما أمكن." } },
  { q: { en: "How long does a divorce case typically take?", ar: "كم يستغرق قضية الطلاق عادةً؟" }, a: { en: "The duration varies depending on whether it's contested or uncontested. Uncontested divorces can be resolved in 2–3 months, while contested cases may take 12–18 months or longer.", ar: "تتفاوت المدة بناءً على ما إذا كانت القضية متنازعاً عليها. يمكن حل حالات الطلاق غير المتنازع عليها في 2-3 أشهر، بينما قد تستغرق القضايا المتنازع عليها من 12 إلى 18 شهراً." } },
  { q: { en: "Do I need a lawyer for estate planning?", ar: "هل أحتاج إلى محامٍ للتخطيط العقاري؟" }, a: { en: "Having an attorney ensures your estate plan is legally sound, comprehensive, and truly reflects your wishes. Mistakes in estate planning can be very costly for your heirs.", ar: "وجود محامٍ يضمن أن خطتك العقارية سليمة قانونياً وشاملة. الأخطاء في التخطيط العقاري قد تكون مكلفة جداً لورثتك." } },
  { q: { en: "What should I bring to my first meeting?", ar: "ماذا يجب أن أحضر إلى اجتماعي الأول؟" }, a: { en: "Bring any relevant documents (contracts, court orders, correspondence), a list of questions, and a timeline of key events. Don't worry if you don't have everything — we'll guide you.", ar: "أحضر أي وثائق ذات صلة (عقود، أوامر المحكمة، مراسلات)، وقائمة بأسئلتك. لا تقلق إذا لم يكن لديك كل شيء — سنرشدك." } },
  { q: { en: "Do you offer payment plans?", ar: "هل تقدمون خطط دفع؟" }, a: { en: "Yes. We offer flexible payment plans for qualifying clients and always discuss fees upfront so there are no surprises.", ar: "نعم. نقدم خطط دفع مرنة للعملاء المؤهلين ونناقش دائماً الرسوم مسبقاً حتى لا تكون هناك مفاجآت." } },
  { q: { en: "Is my information kept confidential?", ar: "هل تُحفظ معلوماتي سرية؟" }, a: { en: "Absolutely. Everything you share with us is protected by attorney-client privilege. Your information will never be shared without your explicit consent.", ar: "بالتأكيد. كل ما تشاركه معنا محمي بموجب امتياز المحامي-الموكل. لن تُشارك معلوماتك دون موافقتك الصريحة." } },
];

const blogs = [
  { tagEn: "Family Law", tagAr: "قانون الأسرة", titleEn: "Understanding Your Rights in a Divorce", titleAr: "فهم حقوقك في الطلاق", descEn: "Divorce can be one of the most emotionally and legally complex situations you'll face. Here's what you need to know to protect yourself and your family.", descAr: "يمكن أن يكون الطلاق من أكثر المواقف تعقيداً. إليك ما تحتاج معرفته لحماية نفسك وعائلتك.", dateEn: "May 12, 2025", dateAr: "12 مايو 2025", read: "6", color: "#1C3530" },
  { tagEn: "Corporate Law", tagAr: "قانون الشركات", titleEn: "5 Things Every Business Owner Should Know About Contracts", titleAr: "5 أشياء يجب على كل صاحب عمل معرفتها عن العقود", descEn: "Contracts are the backbone of every business relationship. Avoid costly mistakes by understanding these five critical contract principles.", descAr: "العقود هي العمود الفقري لكل علاقة تجارية. تجنب الأخطاء المكلفة بفهم هذه المبادئ الخمسة.", dateEn: "Apr 28, 2025", dateAr: "28 أبريل 2025", read: "5", color: "#B8763A" },
  { tagEn: "Estate Planning", tagAr: "التخطيط العقاري", titleEn: "Why Estate Planning Is Not Just for the Wealthy", titleAr: "لماذا التخطيط العقاري ليس فقط للأثرياء", descEn: "Many people put off estate planning, thinking it's only for the wealthy. The truth is, everyone with assets can benefit enormously from proper planning.", descAr: "يؤجل كثيرون التخطيط العقاري ظناً أنه للأثرياء فقط. الحقيقة أن كل شخص يمكن أن يستفيد منه.", dateEn: "Apr 10, 2025", dateAr: "10 أبريل 2025", read: "4", color: "#2D5A4A" },
];

const awards = ["Martindale-Hubbell AV Rated", "Super Lawyers 2024", "Top Law Firm Jordan 2024", "Legal 500 Listed", "ISO 9001 Certified", "Jordan Bar Association", "Client Champion Award 2023", "IFLR1000 Recognized"];
const iconMap: Record<string, ReactNode> = { heart: Icon.heart, briefcase: Icon.briefcase, home: Icon.home, gavel: Icon.gavel };

export default function Home() {
  const [lang, setLang] = useState<Lang>("en");
  const [scrolled, setScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sent, setSent] = useState(false);
const [form, setForm] = useState({ name: "", email: "", phone: "", service: "", message: "" });
const [openFaq, setOpenFaq] = useState<number | null>(null);
const [chatOpen, setChatOpen] = useState(false);
const [chatMsgs, setChatMsgs] = useState<Msg[]>([]);
const [chatInput, setChatInput] = useState("");
const [showCookie, setShowCookie] = useState(true);
const [searchOpen, setSearchOpen] = useState(false);
const [searchQ, setSearchQ] = useState("");
const [contactTab, setContactTab] = useState<"form" | "cal">("form");
const [calDate, setCalDate] = useState<number | null>(null);
const [calTime, setCalTime] = useState<string | null>(null);
const [calBooked, setCalBooked] = useState(false);
const [calMonth, setCalMonth] = useState(new Date().getMonth());
const [calYear, setCalYear] = useState(new Date().getFullYear());
const chatEndRef = useRef<HTMLDivElement>(null);
const heroTagRef = useRef<HTMLDivElement>(null);
const heroLine1Ref = useRef<HTMLSpanElement>(null);
const heroLine2Ref = useRef<HTMLSpanElement>(null);
const heroSubRef = useRef<HTMLParagraphElement>(null);
const heroCtaRef = useRef<HTMLDivElement>(null);
const heroCardRef = useRef<HTMLDivElement>(null);
const kenBurnsRef = useRef<HTMLDivElement>(null);
const statRefs = useRef<(HTMLDivElement | null)[]>([]);
const whyRef = useRef<HTMLElement>(null);
const whyCardRefs = useRef<(HTMLDivElement | null)[]>([]);
const t = T[lang];
const isAr = lang === "ar";
useEffect(() => {
const fn = () => { setScrolled(window.scrollY > 30); setShowScrollTop(window.scrollY > 400); };
window.addEventListener("scroll", fn);
return () => window.removeEventListener("scroll", fn);
}, []);
useEffect(() => {
if (chatOpen && chatMsgs.length === 0) setChatMsgs([{ role: "bot", text: t.chatWelcome }]);
}, [chatOpen]);
useEffect(() => {
chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, [chatMsgs]);

// Lenis smooth scrolling, synced to GSAP's ticker + ScrollTrigger. Skipped entirely for
// users who prefer reduced motion.
useEffect(() => {
  if (prefersReducedMotion()) return;
  let lenisInstance: any;
  let rafCb: ((time: number) => void) | null = null;
  let cancelled = false;
  (async () => {
    const { default: Lenis } = await import("lenis");
    if (cancelled) return;
    lenisInstance = new Lenis({ duration: 1.1, smoothWheel: true });
    lenisInstance.on("scroll", ScrollTrigger.update);
    rafCb = (time: number) => lenisInstance.raf(time * 1000);
    gsap.ticker.add(rafCb);
    gsap.ticker.lagSmoothing(0);
  })();
  return () => {
    cancelled = true;
    if (rafCb) gsap.ticker.remove(rafCb);
    lenisInstance?.destroy();
  };
}, []);

// Hero cinematic entrance: masked line-by-line title reveal, staggered fades, and a
// number count-up on the stat tiles. Runs once on mount.
useEffect(() => {
  const nodes = [heroTagRef.current, heroLine1Ref.current, heroLine2Ref.current, heroSubRef.current, heroCtaRef.current, heroCardRef.current].filter(Boolean) as HTMLElement[];
  if (prefersReducedMotion()) {
    gsap.set(nodes, { autoAlpha: 1, y: 0, yPercent: 0, scale: 1 });
    statRefs.current.forEach((el, i) => { if (el) el.textContent = t.heroStats[i]?.v ?? ""; });
    return;
  }
  const ctx = gsap.context(() => {
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    if (heroTagRef.current) tl.fromTo(heroTagRef.current, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.6 });
    if (heroLine1Ref.current) tl.fromTo(heroLine1Ref.current, { yPercent: 100 }, { yPercent: 0, duration: 0.9 }, "-=0.3");
    if (heroLine2Ref.current) tl.fromTo(heroLine2Ref.current, { yPercent: 100 }, { yPercent: 0, duration: 0.9 }, "-=0.7");
    if (heroSubRef.current) tl.fromTo(heroSubRef.current, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.7 }, "-=0.5");
    if (heroCtaRef.current) tl.fromTo(heroCtaRef.current, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.7 }, "-=0.5");
    if (heroCardRef.current) tl.fromTo(heroCardRef.current, { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 1, scale: 1, duration: 0.9 }, "-=0.6");

    if (kenBurnsRef.current) {
      gsap.to(kenBurnsRef.current, { scale: 1.08, duration: 14, ease: "sine.inOut", yoyo: true, repeat: -1 });
    }

    statRefs.current.forEach((el, i) => {
      if (!el) return;
      const raw = t.heroStats[i]?.v ?? "";
      const num = parseFloat(raw.replace(/[^0-9.]/g, "")) || 0;
      const prefix = raw.trim().startsWith("+") ? "+" : "";
      const suffix = raw.includes("%") ? "%" : (raw.trim().endsWith("+") ? "+" : "");
      const counter = { val: 0 };
      gsap.to(counter, {
        val: num, duration: 1.5, delay: 0.9, ease: "power2.out",
        onUpdate: () => { el.textContent = `${prefix}${Math.round(counter.val).toLocaleString()}${suffix}`; },
      });
    });
  });
  return () => ctx.revert();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

// Pin the "Why Cedar Stone" section and scrub the three pillars into view one at a time.
// Desktop + motion-safe only — mobile keeps the normal static 3-column layout.
useEffect(() => {
  if (prefersReducedMotion() || !whyRef.current) return;
  const mm = gsap.matchMedia();
  mm.add("(min-width: 900px)", () => {
    const cards = whyCardRefs.current.filter(Boolean) as HTMLElement[];
    if (cards.length < 3) return () => {};
    const ctx = gsap.context(() => {
      gsap.set(cards[1], { autoAlpha: 0.3, y: 30 });
      gsap.set(cards[2], { autoAlpha: 0.3, y: 30 });
      const tl = gsap.timeline({
        scrollTrigger: { trigger: whyRef.current, start: "top top", end: "+=1400", scrub: 1, pin: true, anticipatePin: 1 },
      });
      tl.to(cards[1], { autoAlpha: 1, y: 0, duration: 1 })
        .to(cards[0], { autoAlpha: 0.35, y: -10, duration: 1 }, "<")
        .to(cards[2], { autoAlpha: 1, y: 0, duration: 1 })
        .to(cards[1], { autoAlpha: 0.35, y: -10, duration: 1 }, "<");
    }, whyRef);
    return () => ctx.revert();
  });
  return () => mm.revert();
}, []);

const sendChat = () => {
if (!chatInput.trim()) return;
const userMsg = chatInput.trim();
setChatMsgs(m => [...m, { role: "user", text: userMsg }]);
setChatInput("");
setTimeout(() => {
const lower = userMsg.toLowerCase();
let reply = isAr ? "شكراً على تواصلك! سيرد أحد محامينا قريباً." : "Thank you for reaching out! One of our attorneys will get back to you shortly.";
if (lower.includes("consult") || lower.includes("book") || lower.includes("appointment") || lower.includes("استشارة") || lower.includes("موعد"))
reply = isAr ? "يسعدنا تحديد موعد لك! يرجى الاتصال على +962 6 555 0199 أو ملء نموذج الاتصال." : "We'd love to schedule a consultation! Please call +962 6 555 0199 or fill out our contact form.";
else if (lower.includes("family") || lower.includes("divorce") || lower.includes("custody") || lower.includes("طلاق") || lower.includes("حضانة"))
reply = isAr ? "يتخصص فريق قانون الأسرة لدينا في قضايا الطلاق والحضانة والتبني. هل تريد تحديد استشارة؟" : "Our family law team specializes in divorce, custody, and adoption cases. Would you like to schedule a consultation?";
else if (lower.includes("business") || lower.includes("corporate") || lower.includes("contract") || lower.includes("شركة") || lower.includes("عقد"))
reply = isAr ? "يقدم فريق الشركات لدينا إرشادات في تأسيس الشركات وصياغة العقود والنزاعات التجارية." : "Our corporate team provides guidance on business formation, contract drafting, and commercial disputes.";
else if (lower.includes("fee") || lower.includes("cost") || lower.includes("price") || lower.includes("رسوم") || lower.includes("سعر") || lower.includes("تكلفة"))
reply = isAr ? "استشارتك الأولى مجانية تماماً! بعد ذلك نناقش الرسوم بشفافية كاملة." : "Your first consultation is completely free! After that, we discuss fees transparently with no hidden charges.";
setChatMsgs(m => [...m, { role: "bot", text: reply }]);
}, 900);
};
const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
const getFirstDay = (y: number, m: number) => new Date(y, m, 1).getDay();
const today = new Date();
const searchResults = searchQ.length > 1 ? [
...practiceAreas.filter(p => p.title[lang].toLowerCase().includes(searchQ.toLowerCase()) || p.desc[lang].toLowerCase().includes(searchQ.toLowerCase())).map(p => ({ type: "Practice Area", title: p.title[lang], href: "#practice-areas" })),
...faqs.filter(f => f.q[lang].toLowerCase().includes(searchQ.toLowerCase()) || f.a[lang].toLowerCase().includes(searchQ.toLowerCase())).map(f => ({ type: "FAQ", title: f.q[lang], href: "#faq" })),
...blogs.filter(b => (isAr ? b.titleAr : b.titleEn).toLowerCase().includes(searchQ.toLowerCase())).map(b => ({ type: "Blog", title: isAr ? b.titleAr : b.titleEn, href: "#blog" })),
] : [];
const C = { bg: "#FAF8F4", bgAlt: "#F0EAE0", primary: "#1C3530", accent: "#B8763A", text: "#1A2420", muted: "#6B7A70", border: "#DDD4C2", white: "#FFFFFF" };
const serif: React.CSSProperties = { fontFamily: "var(--font-cormorant), 'Cormorant Garamond', serif" };
const inputStyle: React.CSSProperties = { width: "100%", padding: "0.7rem 1rem", border: `1.5px solid ${C.border}`, borderRadius: "8px", fontSize: "0.9rem", backgroundColor: C.bg, color: C.text, outline: "none", fontFamily: "var(--font-dm-sans), sans-serif", transition: "border-color 0.2s ease" };
const dir = isAr ? "rtl" : "ltr";
return (
<div style={{ backgroundColor: C.bg, color: C.text, overflowX: "hidden" }} dir={dir}>
  <noscript>
    <style>{`.hero-tag,.hero-title,.hero-sub,.hero-ctas,.hero-card,.reveal-el{opacity:1 !important;transform:none !important;}`}</style>
  </noscript>
  {showCookie && (
    <div style={{ position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)", zIndex: 200, backgroundColor: C.primary, color: C.white, padding: "1rem 1.5rem", borderRadius: 12, display: "flex", alignItems: "center", gap: "1.5rem", boxShadow: "0 8px 32px rgba(0,0,0,0.2)", maxWidth: 520, width: "calc(100% - 3rem)", flexWrap: "wrap" }}>
      <p style={{ fontSize: "0.875rem", flex: 1, lineHeight: 1.5 }}>{t.cookieText}</p>
      <div style={{ display: "flex", gap: "0.75rem" }}>
        <button onClick={() => setShowCookie(false)} style={{ backgroundColor: C.accent, color: C.white, border: "none", padding: "0.45rem 1rem", borderRadius: 6, fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>{t.cookieAccept}</button>
        <button onClick={() => setShowCookie(false)} style={{ backgroundColor: "transparent", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.2)", padding: "0.45rem 1rem", borderRadius: 6, fontSize: "0.8rem", cursor: "pointer" }}>{t.cookieDecline}</button>
      </div>
    </div>
  )}

  {/* SEARCH OVERLAY */}
  {searchOpen && (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, backgroundColor: "rgba(28,53,48,0.7)", backdropFilter: "blur(8px)", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "8rem" }} onClick={() => { setSearchOpen(false); setSearchQ(""); }}>
      <div style={{ width: "100%", maxWidth: 600, padding: "0 1.5rem" }} onClick={e => e.stopPropagation()}>
        <div style={{ backgroundColor: C.white, borderRadius: 16, overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem 1.25rem", borderBottom: `1px solid ${C.border}` }}>
            <span style={{ color: C.muted }}>{Icon.search}</span>
            <input autoFocus value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder={t.searchPlaceholder} style={{ flex: 1, border: "none", outline: "none", fontSize: "1rem", backgroundColor: "transparent", color: C.text, fontFamily: "var(--font-dm-sans), sans-serif" }} />
            <button onClick={() => { setSearchOpen(false); setSearchQ(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted }}>{Icon.close}</button>
          </div>
          {searchQ.length > 1 && (
            <div style={{ maxHeight: 320, overflowY: "auto" }}>
              {searchResults.length === 0 ? (
                <p style={{ padding: "1.5rem", color: C.muted, textAlign: "center", fontSize: "0.9rem" }}>{t.searchNoResults}</p>
              ) : searchResults.map((r, i) => (
                <a key={i} href={r.href} onClick={() => { setSearchOpen(false); setSearchQ(""); }} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.875rem 1.25rem", textDecoration: "none", borderBottom: `1px solid ${C.border}`, transition: "background 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.bgAlt)}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <span style={{ fontSize: "0.7rem", padding: "0.2rem 0.6rem", borderRadius: 100, backgroundColor: "rgba(184,118,58,0.1)", color: C.accent, fontWeight: 600 }}>{r.type}</span>
                  <span style={{ fontSize: "0.9rem", color: C.text }}>{r.title}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )}

  {/* NAVBAR */}
  <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, height: 72, padding: "0 2rem", display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: scrolled ? "rgba(250,248,244,0.96)" : "transparent", backdropFilter: scrolled ? "blur(12px)" : "none", borderBottom: scrolled ? `1px solid ${C.border}` : "1px solid transparent", transition: "all 0.3s ease" }}>
    <a href="#" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: C.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>{Icon.scaleSm}</div>
      <span style={{ ...serif, fontSize: "1.25rem", fontWeight: 600, color: C.primary }}>Cedar Stone <span style={{ color: C.accent }}>Legal</span></span>
    </a>
    <div className="hide-mobile" style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
      {t.navLinks.map((item: string, i: number) => (
        <a key={i} href={`#${["about","practice-areas","team","blog","faq","contact"][i]}`}
          style={{ textDecoration: "none", color: C.muted, fontSize: "0.85rem", fontWeight: 500, transition: "color 0.2s" }}
          onMouseEnter={e => (e.currentTarget.style.color = C.primary)}
          onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
        >{item}</a>
      ))}
      <button onClick={() => setSearchOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", color: C.muted, display: "flex", alignItems: "center", transition: "color 0.2s" }} onMouseEnter={e => (e.currentTarget.style.color = C.primary)} onMouseLeave={e => (e.currentTarget.style.color = C.muted)}>{Icon.search}</button>
      <button onClick={() => setLang(l => l === "en" ? "ar" : "en")} style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: `1px solid ${C.border}`, cursor: "pointer", color: C.muted, fontSize: "0.78rem", fontWeight: 600, padding: "0.35rem 0.75rem", borderRadius: 100, transition: "all 0.2s" }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.color = C.primary; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}
      >{Icon.globe} {lang === "en" ? "عربي" : "EN"}</button>
      <a href="#contact" style={{ textDecoration: "none", backgroundColor: C.accent, color: C.white, padding: "0.5rem 1.25rem", borderRadius: 6, fontSize: "0.875rem", fontWeight: 500, transition: "background-color 0.2s" }}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#9E632A")}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = C.accent)}
      >{t.navCta}</a>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
      <button className="show-mobile" onClick={() => setSearchOpen(true)} style={{ display: "none", background: "none", border: "none", cursor: "pointer", color: C.primary }}>{Icon.search}</button>
      <button className="show-mobile" onClick={() => setMenuOpen(!menuOpen)} style={{ display: "none", background: "none", border: "none", cursor: "pointer", color: C.primary }}>{menuOpen ? Icon.close : Icon.menu}</button>
    </div>
  </nav>

  {menuOpen && (
    <div style={{ position: "fixed", top: 72, left: 0, right: 0, zIndex: 99, backgroundColor: C.white, borderBottom: `1px solid ${C.border}`, padding: "1.5rem 2rem", display: "flex", flexDirection: "column", gap: "1.25rem", boxShadow: "0 8px 24px rgba(28,53,48,0.1)" }}>
      {t.navLinks.map((item: string, i: number) => (
        <a key={i} href={`#${["about","practice-areas","team","blog","faq","contact"][i]}`} onClick={() => setMenuOpen(false)} style={{ textDecoration: "none", color: C.primary, fontSize: "1.1rem", fontWeight: 500 }}>{item}</a>
      ))}
      <div style={{ display: "flex", gap: "0.75rem" }}>
        <button onClick={() => setLang(l => l === "en" ? "ar" : "en")} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "none", border: `1px solid ${C.border}`, cursor: "pointer", color: C.muted, fontSize: "0.85rem", fontWeight: 600, padding: "0.6rem", borderRadius: 8 }}>{Icon.globe} {lang === "en" ? "عربي" : "EN"}</button>
        <a href="#contact" onClick={() => setMenuOpen(false)} style={{ flex: 2, textDecoration: "none", textAlign: "center", backgroundColor: C.accent, color: C.white, padding: "0.6rem 1rem", borderRadius: 8, fontSize: "1rem", fontWeight: 500 }}>{t.navCta}</a>
      </div>
    </div>
  )}
  {/* COOKIE BANNER */}
  {/* HERO */}
  <section style={{ minHeight: "100vh", paddingTop: 72, position: "relative", overflow: "hidden", display: "flex", alignItems: "center" }}>
    <div ref={kenBurnsRef} style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 65% 40%, rgba(28,53,48,0.07) 0%, transparent 50%), radial-gradient(ellipse at 30% 75%, rgba(184,118,58,0.05) 0%, transparent 45%)", pointerEvents: "none", transformOrigin: "center center", willChange: "transform" }} />
    <div style={{ position: "absolute", top: 0, right: 0, width: "55%", height: "100%", background: "radial-gradient(circle at 70% 40%, rgba(184,118,58,0.07) 0%, transparent 60%)", pointerEvents: "none" }} />
    <div style={{ maxWidth: 1180, margin: "0 auto", padding: "4rem 2rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center", width: "100%" }} className="hero-grid">
      <div>
        <div ref={heroTagRef} className="hero-tag" style={{ display: "inline-flex", alignItems: "center", gap: 8, backgroundColor: "rgba(184,118,58,0.1)", border: "1px solid rgba(184,118,58,0.25)", color: C.accent, padding: "0.35rem 0.9rem", borderRadius: 100, fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "1.5rem", opacity: 0 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: C.accent, display: "inline-block" }} />{t.heroTag}
        </div>
        <h1 className="hero-title" style={{ ...serif, fontSize: "clamp(3.5rem, 8vw, 7.5rem)", fontWeight: 600, lineHeight: 1.03, letterSpacing: "-0.03em", color: C.primary, marginBottom: "1.5rem" }}>
          <span style={{ display: "block", overflow: "hidden" }}><span ref={heroLine1Ref} style={{ display: "inline-block" }}>{t.heroTitle1}</span></span>
          <span style={{ display: "block", overflow: "hidden" }}><span ref={heroLine2Ref} style={{ display: "inline-block", color: C.accent, fontStyle: "italic" }}>{t.heroTitle2}</span></span>
        </h1>
        <p ref={heroSubRef} className="hero-sub" style={{ fontSize: "1.05rem", lineHeight: 1.8, color: C.muted, maxWidth: 480, marginBottom: "2.5rem", opacity: 0 }}>{t.heroDesc}</p>
        <div ref={heroCtaRef} className="hero-ctas" style={{ display: "flex", gap: "1rem", flexWrap: "wrap", opacity: 0 }}>
          <Magnetic>
            <a href="#contact" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8, backgroundColor: C.primary, color: C.white, padding: "0.875rem 1.75rem", borderRadius: 8, fontSize: "0.925rem", fontWeight: 500, boxShadow: "0 4px 14px rgba(28,53,48,0.25)", transition: "all 0.2s ease" }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#2A4D46"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = C.primary; e.currentTarget.style.transform = "none"; }}
            >{t.heroCta1} {Icon.arrow}</a>
          </Magnetic>
          <a href="#practice-areas" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8, border: `1.5px solid ${C.border}`, backgroundColor: "transparent", color: C.primary, padding: "0.875rem 1.75rem", borderRadius: 8, fontSize: "0.925rem", fontWeight: 500, transition: "all 0.2s ease" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.backgroundColor = "rgba(28,53,48,0.04)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.backgroundColor = "transparent"; }}
          >{t.heroCta2}</a>
        </div>
      </div>
      <div ref={heroCardRef} className="hero-card" style={{ position: "relative", display: "flex", justifyContent: "center", opacity: 0 }}>
        <div style={{ width: "100%", maxWidth: 420, backgroundColor: C.primary, borderRadius: 20, padding: "2.75rem 2.25rem", position: "relative", overflow: "hidden", boxShadow: "0 24px 64px rgba(28,53,48,0.28)" }}>
          {[200,160,120].map((s,i) => <div key={i} style={{ position:"absolute", width:s, height:s, borderRadius:"50%", border:`${40-i*8}px solid rgba(255,255,255,0.04)`, top:-40+i*10, right:-40+i*10 }}/>)}
          <div style={{ width:52, height:52, borderRadius:14, backgroundColor:"rgba(184,118,58,0.18)", display:"flex", alignItems:"center", justifyContent:"center", color:C.accent, marginBottom:"1.75rem" }}>{Icon.scale}</div>
          <h3 style={{ ...serif, fontSize:"1.75rem", color:C.white, fontWeight:600, lineHeight:1.2, marginBottom:"0.75rem" }}>{t.heroCardTitle}</h3>
          <p style={{ color:"rgba(255,255,255,0.5)", fontSize:"0.875rem", lineHeight:1.75, marginBottom:"2rem" }}>{t.heroCardDesc}</p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0.875rem" }}>
            {t.heroStats.map(({ v, l }: { v: string; l: string }, i: number) => (
              <div key={l} style={{ backgroundColor:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:10, padding:"0.875rem" }}>
                <div ref={(el) => { statRefs.current[i] = el; }} style={{ ...serif, fontSize:"1.5rem", fontWeight:700, color:C.accent }}>{v}</div>
                <div style={{ fontSize:"0.75rem", color:"rgba(255,255,255,0.45)", marginTop:2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ position:"absolute", bottom:-18, [isAr?"right":"left"]:-18, backgroundColor:C.white, borderRadius:12, padding:"0.875rem 1.25rem", boxShadow:"0 8px 32px rgba(28,53,48,0.14)", border:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:"50%", backgroundColor:"rgba(184,118,58,0.1)", display:"flex", alignItems:"center", justifyContent:"center", color:C.accent }}>{Icon.check}</div>
          <div><div style={{ fontSize:"0.8rem", fontWeight:600, color:C.primary }}>{t.heroBadgeTitle}</div><div style={{ fontSize:"0.72rem", color:C.muted }}>{t.heroBadgeSub}</div></div>
        </div>
      </div>
    </div>
    <div style={{ position:"absolute", bottom:0, left:0, right:0, lineHeight:0 }}>
      <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" style={{ display:"block" }}>
        <path d="M0 60L60 50C120 40 240 20 360 15C480 10 600 20 720 25C840 30 960 30 1080 25C1200 20 1320 10 1380 5L1440 0V60H0Z" fill="#F0EAE0"/>
      </svg>
    </div>
  </section>

  {/* AWARDS MARQUEE */}
  <div style={{ backgroundColor: C.primary, padding: "1rem 0", overflow: "hidden" }}>
    <div className="marquee-track" style={{ whiteSpace: "nowrap" }}>
      {[...awards, ...awards].map((a, i) => (
        <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", padding: "0 2.5rem", fontSize: "0.82rem", fontWeight: 500, color: "rgba(255,255,255,0.65)" }}>
          {a}<span style={{ color: C.accent, fontSize: "0.5rem" }}>●</span>
        </span>
      ))}
    </div>
  </div>

  {/* ABOUT */}
  <section id="about" style={{ backgroundColor: C.bgAlt, padding: "6rem 2rem" }}>
    <div className="two-col" style={{ maxWidth:1100, margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"5rem", alignItems:"center" }}>
      <Reveal>
        <div style={{ position:"relative" }}>
          <div style={{ backgroundColor:C.primary, borderRadius:20, padding:"2.75rem", minHeight:340, display:"flex", flexDirection:"column", justifyContent:"flex-end", position:"relative", overflow:"hidden" }}>
            {[240,180,120,70].map((s,i) => <div key={i} style={{ position:"absolute", width:s, height:s, borderRadius:"50%", border:"1px solid rgba(255,255,255,0.06)", top:`${-10+i*8}%`, right:`${-10-i*8}%` }}/>)}
            <div style={{ position:"relative", zIndex:1 }}>
              <div style={{ color:"rgba(184,118,58,0.85)", marginBottom:"0.75rem" }}>{Icon.scale}</div>
              <h3 style={{ ...serif, fontSize:"1.85rem", color:C.white, fontWeight:600, lineHeight:1.2 }}>{t.aboutQuote}</h3>
              <p style={{ color:"rgba(255,255,255,0.45)", fontSize:"0.85rem", marginTop:"0.75rem" }}>{t.aboutQuoteSub}</p>
            </div>
          </div>
          <div style={{ position:"absolute", top:36, [isAr?"left":"right"]:-28, backgroundColor:C.white, borderRadius:12, padding:"1.25rem 1.5rem", boxShadow:"0 8px 32px rgba(28,53,48,0.12)", border:`1px solid ${C.border}`, minWidth:152 }}>
            <div style={{ fontSize:"0.7rem", color:C.muted, fontWeight:600, letterSpacing:"0.05em", textTransform:"uppercase", marginBottom:4 }}>{t.established}</div>
            <div style={{ ...serif, fontSize:"2rem", fontWeight:700, color:C.primary }}>2004</div>
            <div style={{ fontSize:"0.78rem", color:C.muted }}>{t.yearsOfTrust}</div>
          </div>
        </div>
      </Reveal>
      <div>
        <Reveal style={{ position: "relative" }}>
          <GhostNum n="01" color={C.primary} />
          <div style={{ fontSize:"0.75rem", fontWeight:600, color:C.accent, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"0.875rem" }}>{t.aboutTag}</div>
          <h2 style={{ ...serif, fontSize:"clamp(2rem,3vw,3rem)", fontWeight:600, color:C.primary, lineHeight:1.15, marginBottom:"1.5rem" }}>{t.aboutTitle}</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p style={{ fontSize:"1rem", lineHeight:1.8, color:C.muted, marginBottom:"1.25rem" }}>{t.aboutP1}</p>
          <p style={{ fontSize:"1rem", lineHeight:1.8, color:C.muted, marginBottom:"2rem" }}>{t.aboutP2}</p>
        </Reveal>
        <Reveal delay={0.2}>
          <div style={{ display:"flex", flexDirection:"column", gap:"0.75rem" }}>
            {t.aboutChecks.map((item: string) => (
              <div key={item} style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:22, height:22, borderRadius:"50%", backgroundColor:"rgba(184,118,58,0.12)", display:"flex", alignItems:"center", justifyContent:"center", color:C.accent, flexShrink:0 }}>{Icon.check}</div>
                <span style={{ fontSize:"0.925rem", color:C.text }}>{item}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </div>
  </section>

  {/* PRACTICE AREAS */}
  <section id="practice-areas" style={{ padding:"6rem 2rem", backgroundColor:C.bg }}>
    <div style={{ maxWidth:1100, margin:"0 auto" }}>
      <Reveal style={{ textAlign:"center", marginBottom:"3.5rem", position: "relative" }}>
        <GhostNum n="02" color={C.primary} />
        <div style={{ fontSize:"0.75rem", fontWeight:600, color:C.accent, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"0.75rem" }}>{t.practiceTag}</div>
        <h2 style={{ ...serif, fontSize:"clamp(2rem,3.5vw,3rem)", fontWeight:600, color:C.primary, lineHeight:1.15, marginBottom:"1rem" }}>{t.practiceTitle}</h2>
        <p style={{ fontSize:"1rem", color:C.muted, maxWidth:520, margin:"0 auto", lineHeight:1.7 }}>{t.practiceDesc}</p>
      </Reveal>
      <div className="practice-grid" style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"1.5rem" }}>
        {practiceAreas.map(({ iconKey, title, desc, tags }, i) => (
          <Reveal key={i} delay={i*0.1} from={{ y: 50, rotation: isAr ? 3 : -3 }}>
            <div style={{ backgroundColor:C.white, borderRadius:16, padding:"2rem", border:`1px solid ${C.border}`, transition:"all 0.3s ease", height:"100%" }}
              onMouseEnter={e => { const el=e.currentTarget; el.style.borderColor=C.accent; el.style.transform="translateY(-4px)"; el.style.boxShadow="0 12px 40px rgba(28,53,48,0.12)"; }}
              onMouseLeave={e => { const el=e.currentTarget; el.style.borderColor=C.border; el.style.transform="none"; el.style.boxShadow="none"; }}
            >
              <div style={{ width:48, height:48, borderRadius:12, backgroundColor:"rgba(28,53,48,0.07)", display:"flex", alignItems:"center", justifyContent:"center", color:C.primary, marginBottom:"1.25rem" }}>{iconMap[iconKey]}</div>
              <h3 style={{ ...serif, fontSize:"1.55rem", fontWeight:600, color:C.primary, marginBottom:"0.75rem" }}>{title[lang]}</h3>
              <p style={{ fontSize:"0.9rem", color:C.muted, lineHeight:1.75, marginBottom:"1.25rem" }}>{desc[lang]}</p>
              <div style={{ display:"flex", flexWrap:"wrap", gap:"0.5rem" }}>
                {tags[lang].map((tag: string) => <span key={tag} style={{ fontSize:"0.73rem", padding:"0.25rem 0.65rem", borderRadius:100, backgroundColor:"rgba(184,118,58,0.08)", border:"1px solid rgba(184,118,58,0.2)", color:C.accent, fontWeight:500 }}>{tag}</span>)}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>

  {/* TEAM */}
  <section id="team" style={{ padding:"6rem 2rem", backgroundColor:C.bgAlt }}>
    <div style={{ maxWidth:1100, margin:"0 auto" }}>
      <Reveal style={{ textAlign:"center", marginBottom:"3.5rem", position: "relative" }}>
        <GhostNum n="03" color={C.primary} />
        <div style={{ fontSize:"0.75rem", fontWeight:600, color:C.accent, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"0.75rem" }}>{t.teamTag}</div>
        <h2 style={{ ...serif, fontSize:"clamp(2rem,3.5vw,3rem)", fontWeight:600, color:C.primary, lineHeight:1.15, marginBottom:"0.75rem" }}>{t.teamTitle}</h2>
        <p style={{ fontSize:"1rem", color:C.muted, lineHeight:1.7 }}>{t.teamDesc}</p>
      </Reveal>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1.5rem" }} className="practice-grid">
        {team.map((m, i) => (
          <Reveal key={i} delay={i*0.1}>
            <div style={{ backgroundColor:C.white, borderRadius:16, overflow:"hidden", border:`1px solid ${C.border}`, transition:"all 0.3s ease" }}
              onMouseEnter={e => { e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.boxShadow="0 12px 40px rgba(28,53,48,0.12)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none"; }}
            >
              <div style={{ height:140, backgroundColor:m.color, display:"flex", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden" }}>
                {[80,60,40].map((s,j) => <div key={j} style={{ position:"absolute", width:s, height:s, borderRadius:"50%", border:"1px solid rgba(255,255,255,0.1)", bottom:`${-10+j*10}%`, right:`${-5+j*5}%` }}/>)}
                <div style={{ width:72, height:72, borderRadius:"50%", backgroundColor:"rgba(255,255,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center", ...serif, fontSize:"1.75rem", fontWeight:700, color:C.white, position:"relative", zIndex:1 }}>{m.initials}</div>
              </div>
              <div style={{ padding:"1.25rem" }}>
                <h3 style={{ ...serif, fontSize:"1.2rem", fontWeight:600, color:C.primary, marginBottom:"0.2rem" }}>{m.name[lang]}</h3>
                <p style={{ fontSize:"0.78rem", color:C.accent, fontWeight:500, marginBottom:"0.5rem" }}>{m.role[lang]}</p>
                <p style={{ fontSize:"0.75rem", color:C.muted, marginBottom:"0.75rem" }}>{m.spec[lang]}</p>
                <div style={{ display:"inline-flex", alignItems:"center", gap:5, backgroundColor:"rgba(28,53,48,0.06)", borderRadius:100, padding:"0.25rem 0.65rem", fontSize:"0.72rem", color:C.primary, fontWeight:600 }}>
                  {m.exp} {t.yearsExp}
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>

  {/* WHY US — pinned + scrubbed through on desktop */}
  <section id="why-us" ref={whyRef} style={{ padding:"6rem 2rem", backgroundColor:C.primary, position: "relative", overflow: "hidden" }}>
    <div style={{ maxWidth:1100, margin:"0 auto", position: "relative" }}>
      <Reveal style={{ textAlign:"center", marginBottom:"3.5rem", position: "relative" }}>
        <GhostNum n="04" color={C.white} />
        <div style={{ fontSize:"0.75rem", fontWeight:600, color:C.accent, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"0.75rem" }}>{t.whyTag}</div>
        <h2 style={{ ...serif, fontSize:"clamp(2rem,3.5vw,3rem)", fontWeight:600, color:C.white, lineHeight:1.15 }}>
          {t.whyTitle1}<br /><span style={{ color:C.accent, fontStyle:"italic" }}>{t.whyTitle2}</span>
        </h2>
      </Reveal>
      <div className="three-col" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1.5rem" }}>
        {whyUs.map(({ num, title, desc }, i) => (
          <div key={i} ref={(el) => { whyCardRefs.current[i] = el; }} style={{ padding:"2rem", borderRadius:16, border:"1px solid rgba(255,255,255,0.08)", backgroundColor:"rgba(255,255,255,0.04)", transition:"background-color 0.3s ease, border-color 0.3s ease", height:"100%" }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor="rgba(255,255,255,0.08)"; e.currentTarget.style.borderColor="rgba(184,118,58,0.3)"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor="rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor="rgba(255,255,255,0.08)"; }}
          >
            <div style={{ width:44, height:44, borderRadius:10, backgroundColor:"rgba(184,118,58,0.15)", display:"flex", alignItems:"center", justifyContent:"center", color:C.accent, marginBottom:"1.25rem", ...serif, fontSize:"1.1rem", fontWeight:700 }}>{num}</div>
            <h3 style={{ ...serif, fontSize:"1.4rem", fontWeight:600, color:C.white, marginBottom:"0.75rem" }}>{title[lang]}</h3>
            <p style={{ fontSize:"0.9rem", color:"rgba(255,255,255,0.52)", lineHeight:1.8 }}>{desc[lang]}</p>
          </div>
        ))}
      </div>
    </div>
  </section>

  {/* QUOTE BREAK */}
  <section style={{ padding:"8rem 2rem", backgroundColor:C.bg, position:"relative", overflow:"hidden" }}>
    <div style={{ maxWidth:860, margin:"0 auto", textAlign:"center", position:"relative" }}>
      <div aria-hidden="true" style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", ...serif, fontSize:"clamp(9rem,22vw,20rem)", fontWeight:700, color:C.primary, opacity:0.03, lineHeight:1, pointerEvents:"none", userSelect:"none" }}>"</div>
      <Reveal>
        <div style={{ display:"flex", justifyContent:"center", color:C.accent, opacity:0.4, marginBottom:"2rem" }}>{Icon.quote}</div>
        <blockquote style={{ ...serif, fontSize:"clamp(1.7rem, 3.5vw, 2.75rem)", fontWeight:500, color:C.primary, lineHeight:1.35, fontStyle:"italic", letterSpacing:"-0.01em", marginBottom:"2.5rem", position:"relative", zIndex:1 }}>
          {isAr ? '"العدالة الحقيقية تبدأ بمحامٍ يستمع — ويهتم."' : '"True justice begins with an attorney who listens — and genuinely cares."'}
        </blockquote>
        <div style={{ display:"inline-flex", alignItems:"center", gap:"0.875rem" }}>
          <div style={{ height:1, width:48, backgroundColor:C.border }} />
          <span style={{ fontSize:"0.75rem", fontWeight:600, color:C.muted, letterSpacing:"0.1em", textTransform:"uppercase" }}>Cedar Stone Legal</span>
          <div style={{ height:1, width:48, backgroundColor:C.border }} />
        </div>
      </Reveal>
    </div>
  </section>

  {/* TESTIMONIALS */}
  <section style={{ padding:"6rem 2rem", backgroundColor:C.bgAlt }}>
    <div style={{ maxWidth:1100, margin:"0 auto" }}>
      <Reveal style={{ textAlign:"center", marginBottom:"3.5rem", position:"relative" }}>
        <GhostNum n="05" color={C.primary} />
        <div style={{ fontSize:"0.75rem", fontWeight:600, color:C.accent, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"0.75rem" }}>{t.testiTag}</div>
        <h2 style={{ ...serif, fontSize:"clamp(2rem,3.5vw,3rem)", fontWeight:600, color:C.primary, lineHeight:1.15 }}>{t.testiTitle}</h2>
      </Reveal>
      <div className="three-col" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1.5rem" }}>
        {testimonials.map(({ name, role, text, stars }, i) => (
          <Reveal key={i} delay={i*0.1}>
            <div style={{ backgroundColor:C.white, borderRadius:16, padding:"2rem", border:`1px solid ${C.border}`, display:"flex", flexDirection:"column", height:"100%", transition:"box-shadow 0.3s ease" }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow="0 8px 32px rgba(28,53,48,0.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow="none"; }}
            >
              <div style={{ color:"rgba(184,118,58,0.25)", marginBottom:"1rem" }}>{Icon.quote}</div>
              <div style={{ display:"flex", gap:3, color:C.accent, marginBottom:"1rem" }}>{[...Array(stars)].map((_,j) => <span key={j}>{Icon.star}</span>)}</div>
              <p style={{ fontSize:"0.925rem", color:C.muted, lineHeight:1.8, flex:1, marginBottom:"1.5rem", fontStyle:"italic" }}>"{text}"</p>
              <div style={{ display:"flex", alignItems:"center", gap:12, paddingTop:"1rem", borderTop:`1px solid ${C.border}` }}>
                <div style={{ width:40, height:40, borderRadius:"50%", backgroundColor:C.primary, display:"flex", alignItems:"center", justifyContent:"center", color:C.white, fontSize:"0.875rem", fontWeight:600, ...serif }}>{name[0]}</div>
                <div><div style={{ fontSize:"0.875rem", fontWeight:600, color:C.text }}>{name}</div><div style={{ fontSize:"0.75rem", color:C.muted }}>{role}</div></div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>

  {/* BLOG */}
  <section id="blog" style={{ padding:"6rem 2rem", backgroundColor:C.bg }}>
    <div style={{ maxWidth:1100, margin:"0 auto" }}>
      <Reveal style={{ textAlign:"center", marginBottom:"3.5rem", position:"relative" }}>
        <GhostNum n="06" color={C.primary} />
        <div style={{ fontSize:"0.75rem", fontWeight:600, color:C.accent, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"0.75rem" }}>{t.blogTag}</div>
        <h2 style={{ ...serif, fontSize:"clamp(2rem,3.5vw,3rem)", fontWeight:600, color:C.primary, lineHeight:1.15, marginBottom:"0.75rem" }}>{t.blogTitle}</h2>
        <p style={{ fontSize:"1rem", color:C.muted, lineHeight:1.7 }}>{t.blogDesc}</p>
      </Reveal>
      <div className="three-col" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1.5rem" }}>
        {blogs.map((b, i) => (
          <Reveal key={i} delay={i*0.1}>
            <div style={{ backgroundColor:C.white, borderRadius:16, overflow:"hidden", border:`1px solid ${C.border}`, transition:"all 0.3s ease", height:"100%", display:"flex", flexDirection:"column" }}
              onMouseEnter={e => { e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.boxShadow="0 12px 40px rgba(28,53,48,0.12)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="none"; }}
            >
              <div style={{ height:120, backgroundColor:b.color, display:"flex", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden" }}>
                <span style={{ ...serif, fontSize:"3rem", opacity:0.15, color:C.white }}>"</span>
                <div style={{ position:"absolute", top:"1rem", [isAr?"right":"left"]:"1rem", backgroundColor:"rgba(255,255,255,0.15)", borderRadius:100, padding:"0.25rem 0.75rem", fontSize:"0.72rem", fontWeight:600, color:C.white }}>{isAr ? b.tagAr : b.tagEn}</div>
              </div>
              <div style={{ padding:"1.5rem", flex:1, display:"flex", flexDirection:"column" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", marginBottom:"0.75rem", color:C.muted, fontSize:"0.75rem" }}>
                  {Icon.clock}<span>{isAr ? b.dateAr : b.dateEn}</span><span>·</span><span>{b.read} {t.minRead}</span>
                </div>
                <h3 style={{ ...serif, fontSize:"1.25rem", fontWeight:600, color:C.primary, marginBottom:"0.75rem", lineHeight:1.3 }}>{isAr ? b.titleAr : b.titleEn}</h3>
                <p style={{ fontSize:"0.875rem", color:C.muted, lineHeight:1.7, flex:1, marginBottom:"1.25rem" }}>{isAr ? b.descAr : b.descEn}</p>
                <a href="#" style={{ display:"inline-flex", alignItems:"center", gap:6, color:C.accent, textDecoration:"none", fontSize:"0.85rem", fontWeight:600, transition:"gap 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.gap="10px")}
                  onMouseLeave={e => (e.currentTarget.style.gap="6px")}
                >{t.readMore} {Icon.arrow}</a>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>

  {/* FAQ */}
  <section id="faq" style={{ padding:"6rem 2rem", backgroundColor:C.bgAlt }}>
    <div style={{ maxWidth:760, margin:"0 auto" }}>
      <Reveal style={{ textAlign:"center", marginBottom:"3.5rem", position: "relative" }}>
        <GhostNum n="07" color={C.primary} />
        <div style={{ fontSize:"0.75rem", fontWeight:600, color:C.accent, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"0.75rem" }}>{t.faqTag}</div>
        <h2 style={{ ...serif, fontSize:"clamp(2rem,3.5vw,3rem)", fontWeight:600, color:C.primary, lineHeight:1.15, marginBottom:"0.75rem" }}>{t.faqTitle}</h2>
        <p style={{ fontSize:"1rem", color:C.muted, lineHeight:1.7 }}>{t.faqDesc}</p>
      </Reveal>
      <div style={{ display:"flex", flexDirection:"column", gap:"0.875rem" }}>
        {faqs.map((faq, i) => (
          <Reveal key={i} delay={i*0.05}>
            <div style={{ backgroundColor:C.white, borderRadius:12, border:`1px solid ${openFaq===i ? C.accent : C.border}`, overflow:"hidden", transition:"border-color 0.2s ease" }}>
              <button onClick={() => setOpenFaq(openFaq===i ? null : i)} style={{ width:"100%", padding:"1.25rem 1.5rem", display:"flex", alignItems:"center", justifyContent:"space-between", background:"none", border:"none", cursor:"pointer", textAlign:isAr?"right":"left", gap:"1rem" }}>
                <span style={{ fontWeight:500, color:C.primary, ...serif, fontSize:"1.1rem" }}>{faq.q[lang]}</span>
                <span style={{ color:C.accent, flexShrink:0, transform:openFaq===i?"rotate(180deg)":"none", transition:"transform 0.3s ease" }}>{Icon.chevDown}</span>
              </button>
              <div style={{ display:"grid", gridTemplateRows: openFaq===i ? "1fr" : "0fr", transition:"grid-template-rows 0.35s ease" }}>
                <div style={{ overflow:"hidden" }}>
                  <div style={{ padding:"0 1.5rem 1.25rem", borderTop:`1px solid ${C.border}` }}>
                    <p style={{ fontSize:"0.9rem", color:C.muted, lineHeight:1.8, paddingTop:"1rem" }}>{faq.a[lang]}</p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>

  {/* CONTACT */}
  <section id="contact" style={{ padding:"6rem 2rem", backgroundColor:C.bg }}>
    <div style={{ maxWidth:1100, margin:"0 auto" }}>
      <Reveal style={{ textAlign:"center", marginBottom:"3.5rem" }}>
        <div style={{ fontSize:"0.75rem", fontWeight:600, color:C.accent, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"0.75rem" }}>{t.contactTag}</div>
        <h2 style={{ ...serif, fontSize:"clamp(2rem,3.5vw,3rem)", fontWeight:600, color:C.primary, lineHeight:1.15, marginBottom:"0.75rem" }}>{t.contactTitle}</h2>
        <p style={{ fontSize:"1rem", color:C.muted, maxWidth:480, margin:"0 auto", lineHeight:1.7 }}>{t.contactDesc}</p>
      </Reveal>
      <div className="two-col" style={{ display:"grid", gridTemplateColumns:"1fr 1.6fr", gap:"3rem", alignItems:"start" }}>
        <Reveal>
          <div style={{ backgroundColor:C.primary, borderRadius:20, padding:"2.5rem" }}>
            <h3 style={{ ...serif, fontSize:"1.5rem", color:C.white, fontWeight:600, marginBottom:"0.5rem" }}>{t.contactInfoTitle}</h3>
            <p style={{ fontSize:"0.875rem", color:"rgba(255,255,255,0.45)", marginBottom:"2rem", lineHeight:1.7 }}>{t.contactInfoDesc}</p>
            {[{ icon:Icon.phone, label:"Phone", value:"+962 6 555 0199" }, { icon:Icon.mail, label:"Email", value:"info@cedarstone.law" }, { icon:Icon.map, label:"Office", value:"Al-Abdali Blvd, Amman, JO" }].map(({ icon, label, value }) => (
              <div key={label} style={{ display:"flex", gap:14, marginBottom:"1.5rem" }}>
                <div style={{ width:40, height:40, borderRadius:10, backgroundColor:"rgba(184,118,58,0.15)", display:"flex", alignItems:"center", justifyContent:"center", color:C.accent, flexShrink:0 }}>{icon}</div>
                <div><div style={{ fontSize:"0.7rem", color:"rgba(255,255,255,0.38)", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:2 }}>{label}</div><div style={{ fontSize:"0.9rem", color:C.white }}>{value}</div></div>
              </div>
            ))}
            <div style={{ paddingTop:"1.5rem", borderTop:"1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ fontSize:"0.75rem", color:"rgba(255,255,255,0.38)", marginBottom:"0.5rem" }}>{t.officeHours}</div>
              <div style={{ fontSize:"0.875rem", color:"rgba(255,255,255,0.7)" }}>{t.hours1}</div>
              <div style={{ fontSize:"0.875rem", color:"rgba(255,255,255,0.7)" }}>{t.hours2}</div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div style={{ backgroundColor:C.white, borderRadius:20, border:`1px solid ${C.border}`, overflow:"hidden" }}>
            {/* Tabs */}
            <div style={{ display:"flex", borderBottom:`1px solid ${C.border}` }}>
              {(["form","cal"] as const).map((tab) => (
                <button key={tab} onClick={() => setContactTab(tab)} style={{ flex:1, padding:"1rem", border:"none", background:contactTab===tab ? C.white : C.bgAlt, cursor:"pointer", fontSize:"0.875rem", fontWeight:600, color:contactTab===tab ? C.primary : C.muted, borderBottom:contactTab===tab ? `2px solid ${C.accent}` : "2px solid transparent", transition:"all 0.2s", fontFamily:"var(--font-dm-sans), sans-serif" }}>
                  {tab==="form" ? t.formTab : t.calTab}
                </button>
              ))}
            </div>

            <div style={{ padding:"2rem" }}>
              {contactTab==="form" ? (
                sent ? (
                  <div style={{ textAlign:"center", padding:"2rem 0" }}>
                    <div style={{ width:64, height:64, borderRadius:"50%", backgroundColor:"rgba(28,53,48,0.08)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 1.5rem", color:C.primary }}>{Icon.check}</div>
                    <h3 style={{ ...serif, fontSize:"1.75rem", color:C.primary, fontWeight:600, marginBottom:"0.75rem" }}>{t.fSuccess}</h3>
                    <p style={{ color:C.muted, lineHeight:1.7 }}>{t.fSuccessDesc}</p>
                  </div>
                ) : (
                  <form onSubmit={e => { e.preventDefault(); setSent(true); }} style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>
                    <div className="form-row" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.25rem" }}>
                      {[{ label:t.fName, key:"name", type:"text", ph:t.pName }, { label:t.fEmail, key:"email", type:"email", ph:t.pEmail }].map(({ label, key, type, ph }) => (
                        <div key={key}>
                          <label style={{ display:"block", fontSize:"0.8rem", fontWeight:600, color:C.text, marginBottom:6 }}>{label}</label>
                          <input type={type} placeholder={ph} required value={form[key as keyof typeof form]} onChange={e => setForm(f => ({ ...f, [key]:e.target.value }))} style={inputStyle} onFocus={e => (e.target.style.borderColor=C.primary)} onBlur={e => (e.target.style.borderColor=C.border)} />
                        </div>
                      ))}
                    </div>
                    <div>
                      <label style={{ display:"block", fontSize:"0.8rem", fontWeight:600, color:C.text, marginBottom:6 }}>{t.fPhone}</label>
                      <input type="tel" placeholder={t.pPhone} value={form.phone} onChange={e => setForm(f => ({ ...f, phone:e.target.value }))} style={inputStyle} onFocus={e => (e.target.style.borderColor=C.primary)} onBlur={e => (e.target.style.borderColor=C.border)} />
                    </div>
                    <div>
                      <label style={{ display:"block", fontSize:"0.8rem", fontWeight:600, color:C.text, marginBottom:6 }}>{t.fService}</label>
                      <select value={form.service} onChange={e => setForm(f => ({ ...f, service:e.target.value }))} style={{ ...inputStyle, cursor:"pointer" }} onFocus={e => (e.target.style.borderColor=C.primary)} onBlur={e => (e.target.style.borderColor=C.border)}>
                        <option value="">{t.pService}</option>
                        {t.services.map((s: string) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ display:"block", fontSize:"0.8rem", fontWeight:600, color:C.text, marginBottom:6 }}>{t.fMessage}</label>
                      <textarea placeholder={t.pMessage} rows={4} value={form.message} onChange={e => setForm(f => ({ ...f, message:e.target.value }))} style={{ ...inputStyle, resize:"vertical", minHeight:100 }} onFocus={e => (e.target.style.borderColor=C.primary)} onBlur={e => (e.target.style.borderColor=C.border)} />
                    </div>
                    <button type="submit" style={{ backgroundColor:C.primary, color:C.white, border:"none", padding:"0.9rem 2rem", borderRadius:8, fontSize:"0.925rem", fontWeight:500, cursor:"pointer", fontFamily:"var(--font-dm-sans), sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:8, transition:"all 0.2s ease" }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor="#2A4D46"; e.currentTarget.style.transform="translateY(-1px)"; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor=C.primary; e.currentTarget.style.transform="none"; }}
                    >{t.fSubmit} {Icon.arrow}</button>
                    <p style={{ fontSize:"0.73rem", color:C.muted, textAlign:"center" }}>{t.fPrivacy}</p>
                  </form>
                )
              ) : (
                calBooked ? (
                  <div style={{ textAlign:"center", padding:"2rem 0" }}>
                    <div style={{ width:64, height:64, borderRadius:"50%", backgroundColor:"rgba(28,53,48,0.08)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 1.5rem", color:C.primary }}>{Icon.check}</div>
                    <h3 style={{ ...serif, fontSize:"1.75rem", color:C.primary, fontWeight:600, marginBottom:"0.75rem" }}>{t.calConfirmed}</h3>
                    <p style={{ color:C.muted, lineHeight:1.7 }}>{t.calConfirmedDesc}</p>
                    {calDate && calTime && <div style={{ marginTop:"1.5rem", backgroundColor:C.bgAlt, borderRadius:10, padding:"1rem", display:"inline-block" }}>
                      <div style={{ fontSize:"0.875rem", fontWeight:600, color:C.primary }}>{t.monthNames[calMonth]} {calDate}, {calYear}</div>
                      <div style={{ fontSize:"0.875rem", color:C.muted }}>{calTime}</div>
                    </div>}
                  </div>
                ) : (
                  <div>
                    <p style={{ fontSize:"0.875rem", color:C.muted, marginBottom:"1.5rem" }}>{t.calDesc}</p>
                    {/* Month nav */}
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1rem" }}>
                      <button onClick={() => { if(calMonth===0){setCalMonth(11);setCalYear(y=>y-1);}else setCalMonth(m=>m-1); }} style={{ background:"none", border:`1px solid ${C.border}`, borderRadius:8, cursor:"pointer", padding:"0.4rem", color:C.muted, display:"flex" }}>{Icon.chevLeft}</button>
                      <span style={{ ...serif, fontSize:"1.1rem", fontWeight:600, color:C.primary }}>{t.monthNames[calMonth]} {calYear}</span>
                      <button onClick={() => { if(calMonth===11){setCalMonth(0);setCalYear(y=>y+1);}else setCalMonth(m=>m+1); }} style={{ background:"none", border:`1px solid ${C.border}`, borderRadius:8, cursor:"pointer", padding:"0.4rem", color:C.muted, display:"flex" }}>{Icon.chevRight}</button>
                    </div>
                    {/* Day names */}
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:"4px", marginBottom:"4px" }}>
                      {t.dayNames.map((d: string) => <div key={d} style={{ textAlign:"center", fontSize:"0.7rem", color:C.muted, fontWeight:600, padding:"4px 0" }}>{d}</div>)}
                    </div>
                    {/* Calendar grid */}
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:"4px", marginBottom:"1.5rem" }}>
                      {[...Array(getFirstDay(calYear,calMonth))].map((_,i) => <div key={`e${i}`}/>)}
                      {[...Array(getDaysInMonth(calYear,calMonth))].map((_,i) => {
                        const d=i+1, isPast=new Date(calYear,calMonth,d)<new Date(today.getFullYear(),today.getMonth(),today.getDate()), isSel=calDate===d;
                        return <button key={d} disabled={isPast} onClick={() => setCalDate(d)} style={{ padding:"0.4rem", borderRadius:8, border:isSel?`2px solid ${C.accent}`:"1px solid transparent", backgroundColor:isSel?"rgba(184,118,58,0.1)":isPast?"transparent":"rgba(28,53,48,0.03)", color:isPast?C.border:C.primary, cursor:isPast?"default":"pointer", fontSize:"0.85rem", fontWeight:isSel?600:400, transition:"all 0.15s" }}>{d}</button>;
                      })}
                    </div>
                    {/* Time slots */}
                    {calDate && <div>
                      <p style={{ fontSize:"0.8rem", fontWeight:600, color:C.text, marginBottom:"0.75rem" }}>Select a time:</p>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:"0.5rem", marginBottom:"1.5rem" }}>
                        {t.timeSlots.map((slot: string) => (
                          <button key={slot} onClick={() => setCalTime(slot)} style={{ padding:"0.4rem 0.85rem", borderRadius:100, border:`1.5px solid ${calTime===slot?C.accent:C.border}`, backgroundColor:calTime===slot?"rgba(184,118,58,0.08)":"transparent", color:calTime===slot?C.accent:C.muted, cursor:"pointer", fontSize:"0.82rem", fontWeight:calTime===slot?600:400, transition:"all 0.15s" }}>{slot}</button>
                        ))}
                      </div>
                    </div>}
                    {calDate && calTime && (
                      <button onClick={() => setCalBooked(true)} style={{ width:"100%", backgroundColor:C.primary, color:C.white, border:"none", padding:"0.9rem", borderRadius:8, fontSize:"0.925rem", fontWeight:500, cursor:"pointer", fontFamily:"var(--font-dm-sans), sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                        {t.calConfirm} {Icon.arrow}
                      </button>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  </section>

  {/* FOOTER */}
  <footer style={{ backgroundColor:C.primary, padding:"3.5rem 2rem 2rem", borderTop:"1px solid rgba(255,255,255,0.07)" }}>
    <div style={{ maxWidth:1100, margin:"0 auto" }}>
      <div style={{ display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:"2.5rem", paddingBottom:"2.5rem", borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ maxWidth:280 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:"0.875rem" }}>
            <div style={{ width:32, height:32, borderRadius:"50%", backgroundColor:C.accent, display:"flex", alignItems:"center", justifyContent:"center" }}>{Icon.scaleSm}</div>
            <span style={{ ...serif, fontSize:"1.15rem", fontWeight:600, color:C.white }}>Cedar Stone <span style={{ color:C.accent }}>Legal</span></span>
          </div>
          <p style={{ fontSize:"0.85rem", color:"rgba(255,255,255,0.4)", lineHeight:1.75 }}>{t.footerDesc}</p>
        </div>
        <div className="footer-links" style={{ display:"flex", gap:"4rem", flexWrap:"wrap" }}>
          {[{ title:t.footerCol1Title, links:t.footerCol1Links }, { title:t.footerCol2Title, links:t.footerCol2Links }].map(({ title, links }) => (
            <div key={title}>
              <div style={{ fontSize:"0.72rem", fontWeight:600, color:"rgba(255,255,255,0.35)", letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:"1rem" }}>{title}</div>
              <div style={{ display:"flex", flexDirection:"column", gap:"0.6rem" }}>
                {links.map((link: string) => <a key={link} href="#" style={{ fontSize:"0.875rem", color:"rgba(255,255,255,0.55)", textDecoration:"none", transition:"color 0.2s" }} onMouseEnter={e => (e.currentTarget.style.color=C.accent)} onMouseLeave={e => (e.currentTarget.style.color="rgba(255,255,255,0.55)")}>{link}</a>)}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"1rem", paddingTop:"1.5rem" }}>
        <p style={{ fontSize:"0.75rem", color:"rgba(255,255,255,0.3)" }}>© {new Date().getFullYear()} {t.footerRights}</p>
        <div style={{ display:"flex", gap:"1.5rem" }}>
          {t.footerLegal.map((link: string) => <a key={link} href="#" style={{ fontSize:"0.75rem", color:"rgba(255,255,255,0.3)", textDecoration:"none", transition:"color 0.2s" }} onMouseEnter={e => (e.currentTarget.style.color="rgba(255,255,255,0.65)")} onMouseLeave={e => (e.currentTarget.style.color="rgba(255,255,255,0.3)")}>{link}</a>)}
        </div>
      </div>
    </div>
  </footer>

  {/* WHATSAPP BUTTON */}
  <a href="https://wa.me/96265550199" target="_blank" rel="noopener noreferrer" style={{ position:"fixed", bottom:24, [isAr?"left":"right"]:24, zIndex:150, width:52, height:52, borderRadius:"50%", backgroundColor:"#25D366", display:"flex", alignItems:"center", justifyContent:"center", color:C.white, boxShadow:"0 4px 20px rgba(37,211,102,0.4)", transition:"transform 0.2s, box-shadow 0.2s", textDecoration:"none" }}
    onMouseEnter={e => { e.currentTarget.style.transform="scale(1.1)"; e.currentTarget.style.boxShadow="0 6px 28px rgba(37,211,102,0.55)"; }}
    onMouseLeave={e => { e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="0 4px 20px rgba(37,211,102,0.4)"; }}
  >{Icon.whatsapp}</a>

  {/* LIVE CHAT */}
  <div style={{ position:"fixed", bottom:88, [isAr?"left":"right"]:24, zIndex:150 }}>
    {chatOpen && (
      <div style={{ position:"absolute", bottom:60, [isAr?"left":"right"]:0, width:320, backgroundColor:C.white, borderRadius:16, boxShadow:"0 12px 48px rgba(28,53,48,0.18)", border:`1px solid ${C.border}`, overflow:"hidden" }}>
        <div style={{ backgroundColor:C.primary, padding:"1rem 1.25rem", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div><div style={{ fontSize:"0.875rem", fontWeight:600, color:C.white }}>{t.chatTitle}</div><div style={{ fontSize:"0.72rem", color:"rgba(255,255,255,0.5)" }}>{t.chatSub}</div></div>
          <button onClick={() => setChatOpen(false)} style={{ background:"none", border:"none", cursor:"pointer", color:"rgba(255,255,255,0.7)" }}>{Icon.close}</button>
        </div>
        <div style={{ height:240, overflowY:"auto", padding:"1rem", display:"flex", flexDirection:"column", gap:"0.75rem" }}>
          {chatMsgs.map((msg, i) => (
            <div key={i} style={{ display:"flex", justifyContent:msg.role==="user"?"flex-end":"flex-start" }}>
              <div style={{ maxWidth:"80%", padding:"0.6rem 0.875rem", borderRadius:msg.role==="user"?"12px 12px 4px 12px":"12px 12px 12px 4px", backgroundColor:msg.role==="user"?C.primary:"rgba(28,53,48,0.06)", color:msg.role==="user"?C.white:C.text, fontSize:"0.85rem", lineHeight:1.5 }}>{msg.text}</div>
            </div>
          ))}
          <div ref={chatEndRef}/>
        </div>
        <div style={{ padding:"0.75rem", borderTop:`1px solid ${C.border}`, display:"flex", gap:"0.5rem" }}>
          <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key==="Enter" && sendChat()} placeholder={t.chatPlaceholder} style={{ flex:1, padding:"0.5rem 0.75rem", border:`1px solid ${C.border}`, borderRadius:8, fontSize:"0.85rem", outline:"none", fontFamily:"var(--font-dm-sans), sans-serif", backgroundColor:C.bg }} />
          <button onClick={sendChat} style={{ backgroundColor:C.accent, color:C.white, border:"none", borderRadius:8, padding:"0.5rem 0.75rem", cursor:"pointer", display:"flex", alignItems:"center" }}>{Icon.send}</button>
        </div>
      </div>
    )}
    <button onClick={() => setChatOpen(o => !o)} style={{ width:52, height:52, borderRadius:"50%", backgroundColor:C.primary, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:C.white, boxShadow:"0 4px 20px rgba(28,53,48,0.3)", transition:"transform 0.2s" }}
      onMouseEnter={e => (e.currentTarget.style.transform="scale(1.1)")}
      onMouseLeave={e => (e.currentTarget.style.transform="none")}
    >{chatOpen ? Icon.close : Icon.chatBubble}</button>
  </div>

  {/* SCROLL TO TOP */}
  {showScrollTop && (
    <button onClick={() => window.scrollTo({ top:0, behavior:"smooth" })} style={{ position:"fixed", bottom:24, [isAr?"right":"left"]:24, zIndex:150, width:44, height:44, borderRadius:"50%", backgroundColor:C.white, border:`1px solid ${C.border}`, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:C.primary, boxShadow:"0 4px 16px rgba(28,53,48,0.12)", transition:"all 0.2s" }}
      onMouseEnter={e => { e.currentTarget.style.backgroundColor=C.primary; e.currentTarget.style.color=C.white; }}
      onMouseLeave={e => { e.currentTarget.style.backgroundColor=C.white; e.currentTarget.style.color=C.primary; }}
    >{Icon.arrowUp}</button>
  )}
</div>
);
}