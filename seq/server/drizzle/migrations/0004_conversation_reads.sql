CREATE TABLE `conversation_reads` (
  `user_id` text NOT NULL REFERENCES `users`(`id`) ON DELETE CASCADE,
  `conv_id` text NOT NULL REFERENCES `conversations`(`id`) ON DELETE CASCADE,
  `read_until_msg_id` integer NOT NULL,
  PRIMARY KEY(`user_id`, `conv_id`)
);
