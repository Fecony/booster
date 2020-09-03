import { Register } from './register'
<<<<<<< HEAD
import { PropertyMetadata, Class } from '../typelevel'
import { RoleAccess } from './role'
=======
import { Class, PropertyMetadata, AnyClass } from '../typelevel'
>>>>>>> 5996992... WIP: Return anything

export interface CommandInterface<TCommand = unknown> extends Class<TCommand> {
  // The command's type is `unknown` because the CommandInterface type specifies the
  // structure of the class, rather than the instance of the commands, which is what
  // arrives to the `handle` static method.
  handle(command: TCommand, register: Register): Promise<void>
}

<<<<<<< HEAD
// We set the TCommand type to `unknown` because at the time of execution of the
// command handlers, we don't really know what's the type, nor we do care about it.
// The type correctness is ensured by the decorator, which ensures all of this.
export interface CommandMetadata<TCommand = unknown> {
  // For the class, we care that it has the static methods specified by CommandInterface
  // and it has at least the properties of a class (like name, constructor, etc...)
  // We don't care about the properties of the instance, so we set the type parameter of
  // Class to unknown.
  readonly class: CommandInterface<TCommand>
=======
export interface CommandHandlerMetadata {
  readonly class: Class<CommandInterface>
>>>>>>> 5996992... WIP: Return anything
  readonly properties: Array<PropertyMetadata>
  readonly returnType: AnyClass
}
