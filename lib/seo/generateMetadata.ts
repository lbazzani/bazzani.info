import fs from 'fs';
import path from 'path';
import sidebarConfig from '../../data/sidebarConfig.json';
import contentConfig from '../../data/content.json';

export interface SEOData {
  skills: string[];
  workExperiences: Array<{
    title: string;
    company: string;
    description: string;
  }>;
  services: string[];
  technologies: string[];
  achievements: string[];
}

/**
 * Reads and parses markdown files to extract SEO-relevant content
 */
export function extractSEODataFromMarkdown(): SEOData {
  const publicMarkdownDir = path.join(process.cwd(), 'public', 'markdown');

  // Extract skills from sidebar config
  const skills = [
    ...sidebarConfig.managerialSkills.map(s => s.name),
    ...sidebarConfig.technicalSkills.map(s => s.name),
  ];

  // Extract work experiences from content.json
  const workExperiences = contentConfig.tabs
    .find(tab => tab.id === 'experience')
    ?.cards.map(card => ({
      title: card.title,
      company: card.title,
      description: card.subtitle,
    })) || [];

  // Read technical skills markdown
  const technicalMdPath = path.join(publicMarkdownDir, 'Technical.md');
  let technologies: string[] = [];

  if (fs.existsSync(technicalMdPath)) {
    const technicalContent = fs.readFileSync(technicalMdPath, 'utf-8');

    // Extract technologies mentioned in Technical.md
    const techKeywords = [
      'Node.js', 'React', 'React Native', 'NEXT.js', 'TypeScript', 'JavaScript',
      'Java', 'C#', 'Python', 'Git', 'Jenkins', 'Docker', 'Kubernetes',
      'Oracle', 'PostgreSQL', 'MongoDB', 'AWS', 'Azure', 'GCP',
      'CI/CD', 'DevOps', 'SAP', 'Machine Learning', 'Generative AI'
    ];

    technologies = techKeywords.filter(tech =>
      technicalContent.toLowerCase().includes(tech.toLowerCase())
    );
  }

  // Read consultant services
  const consultantMdPath = path.join(publicMarkdownDir, 'consultantDetail.md');
  let services: string[] = [];

  if (fs.existsSync(consultantMdPath)) {
    const consultantContent = fs.readFileSync(consultantMdPath, 'utf-8');

    // Extract services from headings and bullet points
    const serviceMatches = consultantContent.match(/###\s+(.+)/g);
    if (serviceMatches) {
      services = serviceMatches.map(match => match.replace('### ', '').trim());
    }
  }

  // Read achievements from Capgemini experience
  const capgeminiMdPath = path.join(publicMarkdownDir, 'capgeminiDetail.md');
  let achievements: string[] = [];

  if (fs.existsSync(capgeminiMdPath)) {
    const capgeminiContent = fs.readFileSync(capgeminiMdPath, 'utf-8');

    // Extract key achievements
    const achievementKeywords = [
      'Digital Transformation',
      'Team Leadership',
      'Client Relationships',
      'Fortune 500',
      'Multi-million dollar programs',
      'Global teams',
      'Cloud-native architectures',
      'DevOps practices',
      'Agile at scale'
    ];

    achievements = achievementKeywords.filter(achievement =>
      capgeminiContent.includes(achievement)
    );
  }

  return {
    skills,
    workExperiences,
    services,
    technologies,
    achievements,
  };
}

/**
 * Generates enhanced structured data for SEO using markdown content
 */
export function generateStructuredData() {
  const seoData = extractSEODataFromMarkdown();

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Lorenzo Bazzani",
    "url": "https://bazzani.info",
    "image": "https://bazzani.info/img/foto.jpeg",
    "jobTitle": "Cloud Infrastructure & Generative AI Consultant",
    "description": "Independent Consultant specializing in Cloud Infrastructure, Generative AI, and Enterprise Software Solutions with over 20 years of experience in technology leadership.",
    "email": "lorenzo@bazzani.info",
    "telephone": "+39 348 3672370",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "Italy"
    },
    "alumniOf": {
      "@type": "EducationalOrganization",
      "name": "Polytechnic University of Turin",
      "sameAs": "https://www.polito.it"
    },
    "knowsAbout": [
      ...seoData.skills,
      ...seoData.technologies,
      "Enterprise Software",
      "Solution Architecture",
      "AI Solutions",
      "RAG",
      "LLMs",
      "Prompt Engineering"
    ],
    "hasOccupation": [
      {
        "@type": "Occupation",
        "name": "Independent Consultant",
        "occupationLocation": {
          "@type": "Country",
          "name": "Italy"
        },
        "skills": seoData.technologies.join(', '),
        "description": "Providing consulting services for cloud architecture and AI implementation"
      },
      {
        "@type": "Occupation",
        "name": "Founder & CEO",
        "occupationLocation": {
          "@type": "City",
          "name": "Houston, Texas"
        },
        "organizationName": "Xyplon",
        "description": "Founded and leading Xyplon, focusing on innovative technology solutions"
      }
    ],
    "workHistory": seoData.workExperiences.map(exp => ({
      "@type": "OrganizationRole",
      "roleName": exp.title,
      "description": exp.description
    })),
    "hasCredential": seoData.achievements.map(achievement => ({
      "@type": "EducationalOccupationalCredential",
      "credentialCategory": "achievement",
      "about": achievement
    })),
    "offers": seoData.services.map(service => ({
      "@type": "Offer",
      "itemOffered": {
        "@type": "Service",
        "name": service,
        "provider": {
          "@type": "Person",
          "name": "Lorenzo Bazzani"
        }
      }
    })),
    "memberOf": {
      "@type": "Organization",
      "name": "Independent Consultant"
    },
    "sameAs": [
      "https://it.linkedin.com/in/lorenzo-bazzani"
    ]
  };
}

/**
 * Generates enhanced keywords from markdown content
 */
export function generateKeywords(): string {
  const seoData = extractSEODataFromMarkdown();

  const keywords = [
    'Lorenzo Bazzani',
    ...seoData.skills,
    ...seoData.technologies,
    ...seoData.services,
    'Consultant',
    'Italy',
    'Enterprise Solutions'
  ];

  return Array.from(new Set(keywords)).join(', ');
}
