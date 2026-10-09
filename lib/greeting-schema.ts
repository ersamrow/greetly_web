import {z} from 'zod';
import {isTemplateId} from './templates';
const colour=z.string().regex(/^#[0-9a-fA-F]{6}$/);
const position=z.object({x:z.number().finite().min(-1080).max(1080),y:z.number().finite().min(-1440).max(1440)});
export const greetingSchema=z.object({
  socialSize:z.enum(['original','square','portrait','story']).optional(),language:z.enum(['en','hi','pa']).optional(),side:z.enum(['front','back']).optional(),back:z.object({heading:z.string().max(90),message:z.string().max(300),website:z.string().max(100)}).optional(),rsvpEmail:z.string().email().max(120).optional(),
  positions:z.object({text:position.optional(),photo:position.optional(),qr:position.optional()}).optional(),
  logoScale:z.number().finite().min(50).max(120).optional(),
  qr:z.object({mode:z.enum(['url','whatsapp','map','contact']),value:z.string().max(400)}).optional(),
  details:z.object({role:z.string().max(60).optional(),phone:z.string().max(40).optional(),email:z.string().max(80).optional(),website:z.string().max(100).optional(),address:z.string().max(140).optional(),date:z.string().max(40).optional(),time:z.string().max(50).optional(),venue:z.string().max(140).optional(),rsvp:z.string().max(120).optional()}).optional(),
  templateId:z.string().refine(isTemplateId,'Unknown template'),name:z.string().max(35),message:z.string().max(200),sender:z.string().max(35),bg:colour,font:z.enum(['Georgia','Arial','Verdana','Courier New','Noto Sans Devanagari','Noto Sans Gurmukhi']),layout:z.enum(['square','vertical']),branding:z.boolean(),photo:z.string().max(1500000).regex(/^data:image\/(?:jpeg|png);base64,[A-Za-z0-9+/=]+$/).optional(),
  heading:z.string().max(90).optional(),headingColor:colour.optional(),textColor:colour.optional(),headingSize:z.number().finite().min(40).max(140).optional(),messageSize:z.number().finite().min(20).max(48).optional(),textAlign:z.enum(['left','center','right']).optional(),photoPlacement:z.enum(['top','bottom','left','right','middle','in-message','after-message']).optional(),photoSize:z.number().finite().min(160).max(360).optional(),photoShape:z.enum(['circle','rounded','square']).optional(),photoZoom:z.number().finite().min(1).max(3).optional(),photoX:z.number().finite().min(0).max(100).optional(),photoY:z.number().finite().min(0).max(100).optional(),
});
