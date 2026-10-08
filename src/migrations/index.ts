import * as migration_20261007_162549_phase_b_auth_users_rbac from './20261007_162549_phase_b_auth_users_rbac';
import * as migration_20261007_173537_phase_c_globals from './20261007_173537_phase_c_globals';
import * as migration_20261007_200052_phase_d_media_library from './20261007_200052_phase_d_media_library';
import * as migration_20261007_212705_phase_e_pages_blocks from './20261007_212705_phase_e_pages_blocks';
import * as migration_20261007_212958_phase_e_block_fields_align from './20261007_212958_phase_e_block_fields_align';
import * as migration_20261007_213556_phase_e_shared_sections from './20261007_213556_phase_e_shared_sections';
import * as migration_20261008_102014_phase_e_about_contact_start from './20261008_102014_phase_e_about_contact_start';
import * as migration_20261008_103522_phase_f_services_projects_insights from './20261008_103522_phase_f_services_projects_insights';
import * as migration_20261008_103658_phase_f_service_glyph_registry from './20261008_103658_phase_f_service_glyph_registry';

export const migrations = [
  {
    up: migration_20261007_162549_phase_b_auth_users_rbac.up,
    down: migration_20261007_162549_phase_b_auth_users_rbac.down,
    name: '20261007_162549_phase_b_auth_users_rbac',
  },
  {
    up: migration_20261007_173537_phase_c_globals.up,
    down: migration_20261007_173537_phase_c_globals.down,
    name: '20261007_173537_phase_c_globals',
  },
  {
    up: migration_20261007_200052_phase_d_media_library.up,
    down: migration_20261007_200052_phase_d_media_library.down,
    name: '20261007_200052_phase_d_media_library',
  },
  {
    up: migration_20261007_212705_phase_e_pages_blocks.up,
    down: migration_20261007_212705_phase_e_pages_blocks.down,
    name: '20261007_212705_phase_e_pages_blocks',
  },
  {
    up: migration_20261007_212958_phase_e_block_fields_align.up,
    down: migration_20261007_212958_phase_e_block_fields_align.down,
    name: '20261007_212958_phase_e_block_fields_align',
  },
  {
    up: migration_20261007_213556_phase_e_shared_sections.up,
    down: migration_20261007_213556_phase_e_shared_sections.down,
    name: '20261007_213556_phase_e_shared_sections',
  },
  {
    up: migration_20261008_102014_phase_e_about_contact_start.up,
    down: migration_20261008_102014_phase_e_about_contact_start.down,
    name: '20261008_102014_phase_e_about_contact_start',
  },
  {
    up: migration_20261008_103522_phase_f_services_projects_insights.up,
    down: migration_20261008_103522_phase_f_services_projects_insights.down,
    name: '20261008_103522_phase_f_services_projects_insights',
  },
  {
    up: migration_20261008_103658_phase_f_service_glyph_registry.up,
    down: migration_20261008_103658_phase_f_service_glyph_registry.down,
    name: '20261008_103658_phase_f_service_glyph_registry'
  },
];
