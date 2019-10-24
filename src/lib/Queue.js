import Bee from 'bee-queue';
// Lógica similar ao models, cada job é importado e inserido na array nomeada de "job"
import CancellationMail from '../app/jobs/CancellationMail';

import redisConfig from '../config/redis';

const jobs = [CancellationMail];

class Queue {
  constructor() {
    this.queues = {};

    this.init();
  }

  /**
   * Lógica: inicia-se uma instância da classe Queue e, para cada job da array jobs,
   * coloca-se sua key no objeto this.queues e cada uma dessa queues tem sua fila,
   * que nesse caso é a conexão com o db Redis e o método que vai realizar a tarefa de fato,
   * neste caso nomeada de "handle" e que é o envio do e-mail
   */
  init() {
    jobs.forEach(({ key, handle }) => {
      // Por que forEach e não map()? Porque não precisa retornar algo
      this.queues[key] = {
        bee: new Bee(key, {
          redis: redisConfig,
        }),
        handle,
      };
    });
  }

  /**
   * add(), adiciona na fila a key "CancellationMail" como primeiro parâmetro
   * e também os dados do agenamento ("appointment") como segundo parâmetro
   */
  add(queue, job) {
    return this.queues[queue].bee.createJob(job).save();
  }

  processQueue() {
    jobs.forEach(job => {
      const { bee, handle } = this.queues[job.key];

      bee.on('failed', this.handleFailure).process(handle);
    });
  }

  handleFailure(job, err) {
    console.log(`Queue ${job.queue.name}: A FILA FALHOU`, err);
  }
}

export default new Queue();
