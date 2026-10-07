import {z} from 'zod';
import {isTemplateId} from './templates';
const colour=z.string().regex(/^#[0-9a-fA-F]{6}$/);
export const greetingSchema=z.object({
  templateId:z.string().refine(isTemplateId,'Unknown template'),name:z.string().max(35),message:z.string().max(200),sender:z.string().max(35),bg:colour,font:z.enum(['Georgia','Arial','Verdana','Courier New']),layout:z.enum(['square','vertical']),branding:z.boolean(),photo:z.string().max(1500000).regex(/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/).optional(),
  heading:z.string().max(90).optional(),headingColor:colour.optional(),textColor:colour.optional(),headingSize:z.number().finite().min(40).max(140).optional(),messageSize:z.number().finite().min(20).max(48).optional(),textAlign:z.enum(['left','center','right']).optional(),photoPlacement:z.enum(['top','bottom','left','right','middle','in-message','after-message']).optional(),photoSize:z.number().finite().min(160).max(360).optional(),photoShape:z.enum(['circle','rounded','square']).optional(),photoZoom:z.number().finite().min(1).max(3).optional(),photoX:z.number().finite().min(0).max(100).optional(),photoY:z.number().finite().min(0).max(100).optional(),
});
