export type ColorCategory = "green" | "orange" | "red" | "blue";

export type ProjectLink = {
  id: string;
  label: string;
  url: string;
  visible: boolean;
  sortOrder: number;
};

export type ProjectTech = {
  id: string;
  label: string;
  colorCategory: ColorCategory;
  sortOrder: number;
};

export type Project = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  whyBuilt: string;
  imageUrl: string | null;
  visible: boolean;
  sortOrder: number;
  techStack: ProjectTech[];
  links: ProjectLink[];
};
