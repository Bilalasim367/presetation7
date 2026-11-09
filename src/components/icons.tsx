import {
  BookOpen,
  Building2,
  Circle,
  ClipboardCheck,
  Drama,
  Eye,
  FlaskConical,
  GraduationCap,
  HeartHandshake,
  Layers,
  Stethoscope,
  Target,
  type LucideIcon,
} from "lucide-react";

const iconMap: Readonly<Record<string, LucideIcon>> = {
  Drama,
  Target,
  Layers,
  Eye,
  ClipboardCheck,
  Stethoscope,
  GraduationCap,
  Building2,
  HeartHandshake,
  FlaskConical,
  BookOpen,
};

export const resolveIcon = (name?: string): LucideIcon => {
  const icon = name ? iconMap[name] : undefined;
  return icon ?? Circle;
};
