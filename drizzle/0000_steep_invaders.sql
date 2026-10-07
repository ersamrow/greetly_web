CREATE TABLE `events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`action` text NOT NULL,
	`template_id` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `greetings` (
	`id` text PRIMARY KEY NOT NULL,
	`payload` text NOT NULL,
	`delete_hash` text NOT NULL,
	`created_at` integer NOT NULL,
	`reports` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `published` (
	`id` text PRIMARY KEY NOT NULL,
	`enabled` integer DEFAULT 1 NOT NULL
);
