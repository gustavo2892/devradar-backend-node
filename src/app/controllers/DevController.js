import * as Yup from 'yup';
import axios from 'axios';

import Dev from '../schemas/Dev';

class DevController {
  async index(request, response) {
    const devs = await Dev.find();

    return response.json(devs);
  }

  async store(request, response) {
    const schema = Yup.object().shape({
      github_username: Yup.string().required(),
      techs: Yup.string().required(),
      latitude: Yup.number(),
      longitude: Yup.number(),
    });

    if (!(await schema.isValid(request.body))) {
      return response.status(400).json({ error: 'Validation fails' });
    }

    const { github_username, techs, latitude, longitude } = request.body;

    const devExists = await Dev.findOne({ github_username });

    if (devExists) {
      return response.status(400).json({ error: 'Dev already exists' });
    }

    const apiResponse = await axios.get(
      `https://api.github.com/users/${github_username}`
    );

    const { name = login, avatar_url, bio } = apiResponse.data;

    const techsArray = techs.split(',').map((tech) => tech.trim());

    const location = {
      type: 'Point',
      coordinates: [longitude, latitude],
    };

    const dev = await Dev.create({
      github_username,
      name,
      avatar_url,
      bio,
      techs: techsArray,
      location,
    });

    return response.json(dev);
  }
}

export default new DevController();
