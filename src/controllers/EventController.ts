import { userRepository } from './../repositories/userRepository';
import { eventRepository } from '../repositories/eventRepository';
import { quotationRepository } from '../repositories/quotationRepository';
import { Event } from "./../entities/Event";
import { User } from '../entities/User';
import { Response, Request } from "express";
import { validate } from "class-validator";
import { EntityNotFoundError } from "typeorm";
import jwt from 'jsonwebtoken';

export class EventController {

  // static async createEvent(req: Request, res: Response) {
  //   let {place, name, date} = req.body;
    
  //   let new_date;
  //   try {
  //     let splitDate = date.split("/");
  //     splitDate.reverse().join("/");
  //     new_date = new Date(splitDate);
  //   } catch (error) {
  //     return res.status(400).send("Invalid Date Format");
  //   }
    

  //   let user: User;
  //   console.log(date);
    
    // try {
    //   user = await userRepository.findOneOrFail({
    //     where: { id: Number(user_id)},
    //   });
    // } catch (error) {
    //   if (error instanceof EntityNotFoundError) {
    //     return res.status(404).send("User not found");
    //   }
    //     return res.status(500).json(error);
    // }

  //   const newEvent = eventRepository.create({
  //     place,
  //     name,
  //     date:new_date,
  //   });
  //   const errors = await validate(newEvent);
  //   if (errors.length > 0) {
  //     return res.status(400).send(errors);
  //   }

  //   try {
  //     await eventRepository.save(newEvent);
  //   } catch (error) {
  //     return res.status(500).json(error);
  //   }
  //   return res.status(201).json(newEvent);
  // }

  static async createEventbyUser(req: Request, res: Response) {
    const token = <any>req.header("Authorization")?.replace("Bearer ", "")


        if (!token) {
            return res.status(401).send("Not logged.")
        }

        let payload

	    try {
		    payload = jwt.verify(token, process.env.JWT_SECRET??"");
	    } catch (error) {
		if (error instanceof jwt.JsonWebTokenError) {
			return res.status(401).end()
		}
		return res.status(400).end()
	    }

    const {id} : any = payload

    let {place, name, date, other_user_id} = req.body;
    
    other_user_id.push(id);

    let user;
    
  
    let new_date;
    try {
      let splitDate = date.split("/");
      splitDate.reverse().join("/");
      new_date = new Date(splitDate);
    } catch (error) {
      return res.status(400).send("Invalid Date Format");
    }

    try {
    
      let qualquernome;
      for(let i = 0; i <= other_user_id.length; i++){
        try {
          qualquernome = []
          let idDescription = await userRepository.findOneBy({ id: Number(other_user_id[i])})
          qualquernome.push(idDescription)
        } catch (error) {
          return res.status(400).send(error);
        }
        
        return qualquernome
    }
    
    user = qualquernome
    console.log(user)
    if (!user) {
      return res.status(404).json({ message: 'User not found'})
    }

    let newEvent = new Event();
    newEvent.place = place
    newEvent.name = name
    newEvent.date = new_date
    newEvent.users = user

    await eventRepository.save(newEvent)

    return res.status(201).json(newEvent)

    } catch (error) {
      return res.status(500).json(error);
    }
    }

  static async putAddUserinEvent(req: Request, res: Response) {
    let {user_id, event_id} = req.body;

    try {
      let user = await userRepository.findOneBy({ id: Number(user_id)}) 

      if (!user) {
        return res.status(404).json({ message: 'User not found'})
      }

      let event = await eventRepository.findOneBy({ id: Number(event_id)})

      if (!event) {
        return res.status(404).json({ message: 'Event not found'})
      }

      if (user) {
        event.users = [user]
      }

      try {
        await eventRepository.save(event.users);
      } catch (error) {
        return res.status(500).json(error);
      }

  } catch (error) {
    return res.status(500).json(error);
  }

  }

  static async getAllEvents(req: Request, res: Response) {
    let allEvents: Array<Event> = [];
    try {
      allEvents = await eventRepository.find()
    } catch (error) {
      console.log(error);
      return res.status(500).send("Internal Server Error");
    }

    return res.status(200).send(allEvents);
  }

  // static async getEventbyIdUser(req: Request, res: Response) {
  //   const { idUser } = req.params;
  //   let user: User;

  //   try {
  //     user = await userRepository.findOneOrFail({
  //       where: { id: Number(idUser)},
  //     });
  //   } catch (error) {
  //     if (error instanceof EntityNotFoundError) {
  //       return res.status(404).send("User not found");
  //     }
  //     return res.status(500).json(error);
  //   }

  //   let allEventsbyUser: Array<Event>;
  //   try {
  //     allEventsbyUser = await eventRepository.find({
  //       where: { user_id: {id: Number(idUser)}}
  //     });
  //   } catch (error) {
  //     return res.status(500).json(error);
  //   }
    
  //   return res.send(allEventsbyUser)
  // }

  static async editUser(req: Request, res: Response) {
    const id = req.params.id;

    let { place, name, date } = req.body;

    let new_date;
    try {
      let splitDate = date.split("/");
      splitDate.reverse().join("/");
      new_date = new Date(splitDate);
    } catch (error) {
      return res.status(400).send("Invalid Date Format");
    }
    
    let event: Event;
    try {
      event = await eventRepository.findOneOrFail({
        where: { id: Number(id)}
      });
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        return res.status(404).send("User not found");
      }
      return res.status(500).json(error);
    }

    if (place) {
      event.place = place
    }
    if (name) {
      event.name = name
    }
    if (date) {
      event.date = new_date
    }

    const errors = await validate(event);
    if (errors.length > 0) {
      return res.status(400).send(errors);
    }

    try {
      await eventRepository.save(event);
    } catch (error) {
      return res.status(500).json(error);
    }

    return res.status(204).send();
  }

  static async deleteEvent(req: Request, res: Response) {
    const id = req.params.id;
    let event: Event;
    try {
      event = await eventRepository.findOneOrFail({
        where: { id: Number(id)}
      });
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        return res.status(404).send("User not found");
      }
      return res.status(500).json(error);
    }

    try {
      eventRepository.delete(id);
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        return res.status(400).json(error.message);
      }
      return res.status(500).json(error);
    }

    return res.status(204).send();
  }

  static async listAllExpected_Expense(req: Request, res: Response) {
    let id = req.params.id
    
    let quotation: any
    
    try {
      quotation = await quotationRepository.createQueryBuilder("quotation").where("quotation.event_id = :event_id", {event_id:id}).addSelect("SUM(quotation.expected_expense)", "sum").groupBy("quotation.event_id").getRawOne();  
    } catch (error) {
      return res.status(400).send(error);
    }
    
    try {
      const {quotation_event_id, sum} = quotation

      let expected_sum_event = {
        event_id:quotation_event_id,
        expected_expense:sum
      }
      return res.json(expected_sum_event)
    } catch (error) {
      return res.status(400).send(error);
    }
    
  }

  static async listAllExpense(req: Request, res: Response) {
    const id = req.params.id

    let quotation: any

    try {
      quotation = await quotationRepository.createQueryBuilder("quotation").where("quotation.event_id=:event_id",{event_id:id}).addSelect("SUM(quotation.actual_expense)", "sum").groupBy("quotation.event_id").getRawOne()
    } catch (error) {
      return res.status(400).send(error);
    }

    try {
      const {quotation_event_id, sum} = quotation

      let actual_sum_event = {
        event_id:quotation_event_id,
        actual_expense:sum
      }
      return res.json(actual_sum_event)
    } catch (error) {
      return res.status(400).send(error);
    }
  }
}

