CREATE TABLE `feedback` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `user_id` text NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE,
  `overall_rating` integer NOT NULL,
  `rating_translator` integer,
  `rating_call` integer,
  `rating_voice` integer,
  `rating_dict` integer,
  `improve_selected` text NOT NULL DEFAULT '[]',
  `recommend` text NOT NULL,
  `comment` text,
  `created_at` integer NOT NULL
);
