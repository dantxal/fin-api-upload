import { getCustomRepository, getRepository } from 'typeorm';
// import AppError from '../errors/AppError';

import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import AppError from '../errors/AppError';

interface CreateTransactionDTO {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category,
  }: CreateTransactionDTO): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    if (type === 'outcome') {
      const { total } = await transactionsRepository.getBalance();
      if (total < value) {
        throw new AppError('Insufficient balance for this transaction.');
      }
    }

    let existingCategory = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (!existingCategory) {
      existingCategory = await categoriesRepository.create({ title: category });
      await categoriesRepository.save(existingCategory);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: existingCategory,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
