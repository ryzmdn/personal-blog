export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  cover_image_url?: string;
  published: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
  view_count: number;
  reading_time: number;
}

export interface Comment {
  id: string;
  post_id: string;
  user_name: string;
  user_email?: string;
  content: string;
  created_at: string;
  approved: boolean;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  created_at: string;
}

export interface DashboardStats {
  totalPosts: number;
  totalViews: number;
  totalSubscribers: number;
}
