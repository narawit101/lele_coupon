import {
  QueuePass,
  Promotion,
  ReviewSubmission,
  PointLog,
  UserProfile,
  UserContextType,
} from "@/types/user";
import { HomeActivity } from "./ActivityFeed";

export type {
  QueuePass,
  Promotion,
  ReviewSubmission,
  PointLog,
  UserProfile,
  UserContextType,
  HomeActivity,
};

export interface UserPassCounts {
  all: number;
  active: number;
  used: number;
}
